import type { Db } from '@repo/database';
import type { AnyPgTable } from 'drizzle-orm/pg-core';

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { orgLeadsTable } from '@repo/database/schema';
import { parse } from 'csv-parse';
import { constants as fsConstants } from 'node:fs';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';

import { DRIZZLE_DB } from '~/constants/provider';

import { FileUploadService } from '../file-upload/file-upload.service';
import { CsvImportQueueService } from './csv-import.queue';

type ColumnMapping = Record<string, string | null>;

type CsvImportColumn = {
  key: string;
  label: string;
  type: CsvImportColumnType;
  description?: string;
};

type CsvImportColumnType = 'string' | 'number' | 'date' | 'string[]';

type CsvImportTableConfig = {
  id: string;
  label: string;
  description?: string;
  table: AnyPgTable;
  columns: CsvImportColumn[];
};

type CsvPreview = {
  fileId: string;
  fileName?: string;
  headers: string[];
  rows: string[][];
};

const ORG_LEADS_COLUMNS: CsvImportColumn[] = [
  { key: 'firstName', label: 'First Name', type: 'string' },
  { key: 'lastName', label: 'Last Name', type: 'string' },
  { key: 'salutation', label: 'Salutation', type: 'string' },
  { key: 'name', label: 'Full Name', type: 'string' },
  { key: 'phone', label: 'Phone', type: 'string' },
  { key: 'phoneE164', label: 'Phone (E164)', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'emailNormalized', label: 'Email Normalized', type: 'string' },
  { key: 'nationality', label: 'Nationality', type: 'string' },
  {
    key: 'tags',
    label: 'Tags',
    type: 'string[]',
    description: 'Comma separated values will be stored as tags array.',
  },
  {
    key: 'categories',
    label: 'Categories',
    type: 'string[]',
    description: 'Comma separated values will be stored as categories array.',
  },
  { key: 'notes', label: 'Notes', type: 'string' },
  {
    key: 'lastActivityAt',
    label: 'Last Activity At',
    type: 'date',
    description: 'ISO date format is recommended.',
  },
  {
    key: 'nextActivityAt',
    label: 'Next Activity At',
    type: 'date',
    description: 'ISO date format is recommended.',
  },
  {
    key: 'score',
    label: 'Score',
    type: 'number',
    description: 'Numeric score. Non numeric values will be stored as null.',
  },
];

const CSV_IMPORT_TABLES: Record<string, CsvImportTableConfig> = {
  orgLeads: {
    id: 'orgLeads',
    label: 'Organization Leads',
    description: 'Import CSV data into the organization leads table.',
    table: orgLeadsTable,
    columns: ORG_LEADS_COLUMNS,
  },
};

@Injectable()
export class CsvImportService {
  private readonly batchSize = 200;
  private readonly logger = new Logger(CsvImportService.name);
  private readonly previewRowLimit = 4; // header + first 3 rows

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly fileUploadService: FileUploadService,
    private readonly queue: CsvImportQueueService,
  ) {}

  async enqueueImport(
    tableId: string,
    fileId: string,
    organizationId: string,
    mapping: ColumnMapping,
  ) {
    const tableConfig = CSV_IMPORT_TABLES[tableId];
    if (!tableConfig) {
      throw new BadRequestException('Unknown table selected for CSV import.');
    }

    const sanitizedMapping = this.sanitizeMapping(mapping, tableConfig.columns);
    const hasAtLeastOneColumn = Object.values(sanitizedMapping).some(
      (value) => value,
    );

    if (!hasAtLeastOneColumn) {
      throw new BadRequestException('Select at least one column to import.');
    }

    const filePath = this.fileUploadService.getUploadFilePath(fileId);

    try {
      await access(filePath, fsConstants.R_OK);
    } catch {
      throw new NotFoundException('Uploaded CSV file was not found.');
    }

    this.queue.enqueue({
      name: `${tableConfig.id}-${fileId}`,
      handler: async () => {
        await this.processCsvImport({
          fileId,
          filePath,
          organizationId,
          table: tableConfig,
          mapping: sanitizedMapping,
        });
      },
    });

    return { status: 'queued' };
  }

  async getPreview(fileId: string): Promise<CsvPreview> {
    const filePath = this.fileUploadService.getUploadFilePath(fileId);

    try {
      await access(filePath, fsConstants.R_OK);
    } catch (_error) {
      throw new NotFoundException('Uploaded CSV file was not found.');
    }

    const metadata = await this.safeGetMetadata(fileId);
    const rows = await this.readPreviewRows(filePath, this.previewRowLimit);

    if (rows.length === 0) {
      return {
        fileId,
        fileName: metadata?.name,
        headers: [],
        rows: [],
      };
    }

    const headerRow = rows[0] ?? [];
    const dataRows = rows.slice(1);
    const headers = this.buildUniqueHeaders(headerRow);

    return {
      fileId,
      fileName: metadata?.name,
      headers,
      rows: dataRows,
    };
  }

  getTableOptions() {
    return Object.values(CSV_IMPORT_TABLES).map(
      ({ id, label, description, columns }) => ({
        id,
        label,
        description,
        columns,
      }),
    );
  }

  private buildUniqueHeaders(headerRow: string[]) {
    const fallbackPrefix = 'Column';
    const counts = new Map<string, number>();

    return headerRow.map((header, index) => {
      const base = header || `${fallbackPrefix} ${index + 1}`;
      const normalized = base.trim() || `${fallbackPrefix} ${index + 1}`;
      const currentCount = counts.get(normalized) ?? 0;
      counts.set(normalized, currentCount + 1);

      if (currentCount === 0) {
        return normalized;
      }

      return `${normalized} (${currentCount + 1})`;
    });
  }

  private convertValue(value: string, type: CsvImportColumnType) {
    if (!value) {
      return undefined;
    }

    switch (type) {
      case 'number': {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
        return null;
      }
      case 'date': {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date;
        }
        return null;
      }
      case 'string[]': {
        const parts = value
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        return parts.length > 0 ? parts : undefined;
      }
      default:
        return value;
    }
  }

  private async insertBatch(
    table: AnyPgTable,
    rows: Record<string, unknown>[],
  ) {
    if (rows.length === 0) {
      return;
    }

    await this.db.insert(table).values(rows as never);
  }

  private mapRow(
    row: string[],
    headerIndex: Map<string, number>,
    columns: CsvImportColumn[],
    mapping: ColumnMapping,
    organizationId: string,
  ) {
    const output: Record<string, unknown> = { organizationId };
    let hasValues = false;

    for (const column of columns) {
      const headerName = mapping[column.key];
      if (!headerName) {
        continue;
      }

      const index = headerIndex.get(headerName);
      if (index === undefined) {
        continue;
      }

      const rawValue = row[index] ?? '';
      const converted = this.convertValue(rawValue, column.type);

      if (converted !== undefined) {
        output[column.key] = converted;
        hasValues = true;
      }
    }

    if (!hasValues) {
      return null;
    }

    return output;
  }

  private prepareRow(record: string[]) {
    return record.map((value, _index) => {
      if (value === undefined || value === null) {
        return '';
      }

      const cleaned = String(value).replace(/\r/g, '');

      if (cleaned.trim().length === 0) {
        return '';
      }

      return cleaned.trim();
    });
  }

  private async processCsvImport(options: {
    fileId: string;
    filePath: string;
    organizationId: string;
    table: CsvImportTableConfig;
    mapping: ColumnMapping;
  }) {
    const { fileId, filePath, organizationId, table, mapping } = options;
    const parser = parse({
      bom: true,
      skip_empty_lines: false,
      relax_column_count: true,
      trim: false,
    });

    const stream = createReadStream(filePath, { encoding: 'utf-8' }).pipe(
      parser,
    );

    let headers: string[] | null = null;
    let headerIndex = new Map<string, number>();
    let batch: Record<string, unknown>[] = [];
    let processedRows = 0;
    const startTime = Date.now();

    try {
      for await (const record of stream) {
        const preparedRow = this.prepareRow(record as string[]);
        if (!headers) {
          headers = this.buildUniqueHeaders(preparedRow);
          headerIndex = new Map(headers.map((value, index) => [value, index]));
          continue;
        }

        const mapped = this.mapRow(
          preparedRow,
          headerIndex,
          table.columns,
          mapping,
          organizationId,
        );

        if (!mapped) {
          continue;
        }

        batch.push(mapped);
        processedRows += 1;

        if (batch.length >= this.batchSize) {
          await this.insertBatch(table.table, batch);
          batch = [];
        }
      }

      if (batch.length > 0) {
        await this.insertBatch(table.table, batch);
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Imported ${processedRows} rows into ${table.id} from file ${fileId} in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process CSV import for file ${fileId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async readPreviewRows(filePath: string, limit: number) {
    const rows: string[][] = [];
    const parser = parse({
      bom: true,
      skip_empty_lines: false,
      relax_column_count: true,
      trim: false,
    });

    const stream = createReadStream(filePath, { encoding: 'utf-8' }).pipe(
      parser,
    );

    try {
      for await (const record of stream) {
        rows.push(this.prepareRow(record as string[]));
        if (rows.length >= limit) {
          stream.destroy();
          break;
        }
      }
    } catch (error) {
      this.logger.error(
        'Failed to read CSV preview rows',
        error instanceof Error ? error.stack : undefined,
      );
      throw new BadRequestException(
        'Unable to preview CSV file. Please verify the format.',
      );
    }

    return rows;
  }

  private async safeGetMetadata(fileId: string) {
    try {
      const metadata = await this.fileUploadService.getUploadMetadata(fileId);
      return metadata;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.warn(
        `Unable to read metadata for uploaded file ${fileId}: ${message}`,
      );

      return null;
    }
  }

  private sanitizeMapping(mapping: ColumnMapping, columns: CsvImportColumn[]) {
    const normalized: ColumnMapping = {};
    for (const column of columns) {
      const value = mapping[column.key];
      normalized[column.key] = value ?? null;
    }
    return normalized;
  }
}
