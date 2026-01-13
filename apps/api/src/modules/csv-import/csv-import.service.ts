import type { Db } from '@repo/database';

import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { parse } from 'csv-parse';
import { and, eq } from 'drizzle-orm';
import { constants as fsConstants } from 'node:fs';
import { createReadStream } from 'node:fs';
import { access } from 'node:fs/promises';

import { DRIZZLE_DB } from '~/constants/provider';

import type {
  ColumnMapping,
  CsvImportColumn,
  CsvImportColumnType,
  CsvImportTableConfig,
  SupportedTable,
} from './csv-import.types';

import { CustomFieldDefinitionsService } from '../core/custom-fields/custom-field-definitions.service';
import { FileUploadService } from '../core/file-upload/file-upload.service';
import {
  CsvImportJobsService,
  type CsvImportJobStatus,
} from './csv-import-jobs.service';
import {
  type CsvImportJobData,
  CsvImportQueueService,
} from './csv-import.queue';
import { TABLE_ID_TO_ENTITY_TYPE } from './entity-type-mapping';
import { CSV_IMPORT_TABLES } from './tables';

type CsvPreview = {
  fileId: string;
  fileName?: string;
  headers: string[];
  rows: string[][];
};

type MappedRow = { id?: string; values: Record<string, unknown> };

@Injectable()
export class CsvImportService {
  private readonly batchSize = 200;
  private readonly logger = new Logger(CsvImportService.name);
  private readonly previewRowLimit = 4; // header + first 3 rows

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly fileUploadService: FileUploadService,
    private readonly queue: CsvImportQueueService,
    private readonly customFieldDefinitionsService: CustomFieldDefinitionsService,
    private readonly csvImportJobsService: CsvImportJobsService,
  ) {}

  async enqueueImport(
    tableId: string,
    fileId: string,
    organizationId: string,
    mapping: ColumnMapping,
    csvImportJobId?: string,
  ) {
    const tableConfig = CSV_IMPORT_TABLES[tableId];
    if (!tableConfig) {
      throw new BadRequestException('Unknown table selected for CSV import.');
    }

    const entityType = TABLE_ID_TO_ENTITY_TYPE[tableConfig.id];

    // Extract and process custom field mappings
    const { customFieldsMapping } = this.separateCustomFieldMappings(mapping);

    // Create custom field definitions for new custom fields
    if (entityType && Object.keys(customFieldsMapping).length > 0) {
      await this.ensureCustomFieldDefinitions(
        organizationId,
        entityType,
        customFieldsMapping,
      );
    }

    // Re-fetch custom field columns after ensuring definitions exist
    const customFieldColumns = entityType
      ? await this.buildCustomFieldColumns(organizationId, entityType)
      : [];

    // Sanitize with both static and custom field columns
    const allColumns = [...tableConfig.columns, ...customFieldColumns];
    const sanitizedMapping = this.sanitizeMapping(mapping, allColumns);
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

    const { bullJobId } = await this.queue.enqueue({
      name: `${tableConfig.id}-${fileId}`,
      data: {
        fileId,
        tableId: tableConfig.id,
        organizationId,
        mapping: sanitizedMapping,
        csvImportJobId,
      },
    });

    return { bullJobId };
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

  async getTableOptions(organizationId: string) {
    const tables = await Promise.all(
      Object.values(CSV_IMPORT_TABLES).map(async (tableConfig) => {
        const entityType = TABLE_ID_TO_ENTITY_TYPE[tableConfig.id];
        const customFieldColumns = entityType
          ? await this.buildCustomFieldColumns(organizationId, entityType)
          : [];

        return {
          id: tableConfig.id,
          label: tableConfig.label,
          description: tableConfig.description,
          columns: [...tableConfig.columns, ...customFieldColumns],
        };
      }),
    );

    return tables;
  }

  async processImportJob(
    job: CsvImportJobData,
    csvImportJobId?: string,
  ): Promise<void> {
    const tableConfig = CSV_IMPORT_TABLES[job.tableId];

    if (!tableConfig) {
      this.logger.warn(
        `Received CSV import job for unknown table: ${job.tableId}`,
      );
      throw new NotFoundException('Unknown table selected for CSV import.');
    }

    const entityType = TABLE_ID_TO_ENTITY_TYPE[tableConfig.id];
    const customFieldColumns = entityType
      ? await this.buildCustomFieldColumns(job.organizationId, entityType)
      : [];

    // Extend table config with custom field columns
    const extendedTableConfig: CsvImportTableConfig = {
      ...tableConfig,
      columns: [...tableConfig.columns, ...customFieldColumns],
    };

    const filePath = this.fileUploadService.getUploadFilePath(job.fileId);

    try {
      await access(filePath, fsConstants.R_OK);
    } catch {
      throw new NotFoundException('Uploaded CSV file was not found.');
    }

    await this.processCsvImport({
      fileId: job.fileId,
      filePath,
      organizationId: job.organizationId,
      table: extendedTableConfig,
      mapping: job.mapping,
      csvImportJobId,
    });
  }

  private async buildCustomFieldColumns(
    organizationId: string,
    entityType: string,
  ): Promise<CsvImportColumn[]> {
    const definitions =
      await this.customFieldDefinitionsService.getByEntityType(
        organizationId,
        entityType,
      );

    return definitions.map((def) => ({
      key: `customFields.${def.key}`,
      label: def.label,
      type: this.mapCustomFieldTypeToCsvType(def.fieldType),
      description: def.description ?? `Custom field: ${def.label}`,
    }));
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
      case 'boolean': {
        const normalized = value.trim().toLowerCase();
        if (['1', 'true', 'y', 'yes'].includes(normalized)) {
          return true;
        }
        if (['0', 'false', 'n', 'no'].includes(normalized)) {
          return false;
        }
        return null;
      }
      case 'json': {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return JSON.parse(value);
        } catch (_error) {
          return null;
        }
      }
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

  private deriveLabelFromHeader(header: string): string {
    return (
      header
        .replace(/[_-]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim()
        .split(' ')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ') || header
    );
  }

  private async ensureCustomFieldDefinitions(
    organizationId: string,
    entityType: string,
    customFieldsMapping: ColumnMapping,
  ): Promise<void> {
    // Get existing definitions
    const existingDefinitions =
      await this.customFieldDefinitionsService.getByEntityType(
        organizationId,
        entityType,
      );

    const existingKeys = new Set(existingDefinitions.map((d) => d.key));

    // Create definitions for new custom fields
    for (const [mappingKey, csvHeader] of Object.entries(customFieldsMapping)) {
      if (!csvHeader) continue; // Skip null/empty mappings

      // Extract custom field key from "customFields.xxx" format
      const customKey = mappingKey.slice('customFields.'.length);

      // Skip if already exists
      if (existingKeys.has(customKey)) {
        continue;
      }

      // Derive label from CSV header (e.g., "custom_attribute_1" -> "Custom Attribute 1")
      const label = this.deriveLabelFromHeader(csvHeader);

      // Create new definition with default type 'string'
      // Note: Data conversion during import will follow the definition type via convertValue()
      try {
        await this.customFieldDefinitionsService.create(organizationId, {
          key: customKey,
          label,
          fieldType: 'string', // Default type - user can edit later if needed
          entityType,
          description: `Created via CSV import from column "${csvHeader}"`,
        });
        this.logger.log(
          `Created custom field definition "${customKey}" for ${entityType}`,
        );
      } catch (error) {
        // Log but don't fail - could be validation errors
        this.logger.warn(
          `Failed to create custom field definition "${customKey}": ${String(error)}`,
        );
      }
    }
  }

  private async insertBatch(
    table: SupportedTable,
    rows: Record<string, unknown>[],
  ) {
    if (rows.length === 0) {
      return;
    }

    await this.db.insert(table).values(rows as never);
  }

  private mapCustomFieldTypeToCsvType(fieldType: string): CsvImportColumnType {
    switch (fieldType) {
      case 'string':
      case 'single_select':
      case 'reference':
      case 'datetime':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'date':
        return 'date';
      case 'multi_select':
        return 'string[]';
      case 'json':
        return 'json';
      default:
        return 'string';
    }
  }

  private mapRow(
    row: string[],
    headerIndex: Map<string, number>,
    columns: CsvImportColumn[],
    mapping: ColumnMapping,
    organizationId: string,
  ): MappedRow | null {
    const values: Record<string, unknown> = { organizationId };
    const customFields: Record<string, unknown> = {};
    let hasValues = false;

    let id: string | undefined;

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const converted = this.convertValue(rawValue, column.type);

      if (column.key === 'id') {
        if (typeof converted === 'string' && converted.trim().length > 0) {
          id = converted.trim();
        }
        continue;
      }

      if (converted !== undefined) {
        // Check if this is a custom field (starts with "customFields.")
        if (column.key.startsWith('customFields.')) {
          const customKey = column.key.slice('customFields.'.length);
          customFields[customKey] = converted;
        } else {
          values[column.key] = converted;
        }
        hasValues = true;
      }
    }

    if (!hasValues) {
      return null;
    }

    // Merge custom fields into the values
    if (Object.keys(customFields).length > 0) {
      values.customFields = customFields;
    }

    return { id, values };
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
    csvImportJobId?: string;
  }) {
    const { fileId, filePath, organizationId, table, mapping, csvImportJobId } =
      options;

    // Update job status to processing if tracking is enabled
    if (csvImportJobId) {
      await this.csvImportJobsService.updateJob(csvImportJobId, {
        status: 'processing',
        startedAt: new Date(),
      });
    }

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
    let insertBatchRows: Record<string, unknown>[] = [];
    let updateBatchRows: { id: string; values: Record<string, unknown> }[] = [];
    let processedRows = 0;
    let successfulRows = 0;
    let failedRows = 0;
    let _insertedRows = 0;
    let _updatedRows = 0;
    let dataRowNumber = 0; // Row number for tracking (excludes header)
    const startTime = Date.now();
    const updateInterval = csvImportJobId ? 10 : 0; // Update job status every N rows

    try {
      for await (const record of stream) {
        const preparedRow = this.prepareRow(record as string[]);
        if (!headers) {
          headers = this.buildUniqueHeaders(preparedRow);
          headerIndex = new Map(headers.map((value, index) => [value, index]));
          continue;
        }

        dataRowNumber += 1;
        let currentRowSuccess = false;
        let recordId: string | undefined;
        let errorMessage: string | undefined;
        let errorField: string | undefined;

        try {
          const mapped = this.mapRow(
            preparedRow,
            headerIndex,
            table.columns,
            mapping,
            organizationId,
          );

          if (!mapped) {
            // Skip row without counting as error
            processedRows += 1;
            continue;
          }

          if (mapped.id) {
            updateBatchRows.push({ id: mapped.id, values: mapped.values });
            _updatedRows = processedRows + 1;
            recordId = mapped.id;
          } else {
            insertBatchRows.push(mapped.values);
            _insertedRows = processedRows + 1;
          }

          processedRows += 1;
          successfulRows += 1;
          currentRowSuccess = true;
        } catch (rowError) {
          failedRows += 1;
          errorMessage =
            rowError instanceof Error ? rowError.message : String(rowError);
          this.logger.warn(
            `Failed to process row ${dataRowNumber} in CSV import: ${errorMessage}`,
          );
        }

        // Track row result if job tracking is enabled
        if (csvImportJobId && !currentRowSuccess) {
          void this.csvImportJobsService.createRowResult({
            jobId: csvImportJobId,
            rowNumber: dataRowNumber,
            status: 'failed',
            rowData: JSON.stringify(preparedRow),
            errorMessage,
            errorField,
            recordId,
          });
        }

        // Flush batches
        if (insertBatchRows.length >= this.batchSize) {
          await this.insertBatch(table.table, insertBatchRows);
          insertBatchRows = [];
        }
        if (updateBatchRows.length >= this.batchSize) {
          await this.updateBatch(table.table, updateBatchRows);
          updateBatchRows = [];
        }

        // Update job progress periodically
        if (
          csvImportJobId &&
          processedRows > 0 &&
          processedRows % updateInterval === 0
        ) {
          void this.csvImportJobsService.updateJob(csvImportJobId, {
            processedRows,
            successfulRows,
            failedRows,
          });
        }
      }

      // Flush remaining batches
      if (insertBatchRows.length > 0) {
        await this.insertBatch(table.table, insertBatchRows);
      }

      if (updateBatchRows.length > 0) {
        await this.updateBatch(table.table, updateBatchRows);
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `Imported ${processedRows} rows into ${table.id} from file ${fileId} in ${duration}ms (${successfulRows} successful, ${failedRows} failed)`,
      );

      // Update final job status
      if (csvImportJobId) {
        const finalStatus: CsvImportJobStatus =
          failedRows > 0 ? 'partial_success' : 'completed';
        await this.csvImportJobsService.updateJob(csvImportJobId, {
          status: finalStatus,
          processedRows,
          successfulRows,
          failedRows,
          completedAt: new Date(),
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to process CSV import for file ${fileId}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Update job status to failed
      if (csvImportJobId) {
        await this.csvImportJobsService.updateJob(csvImportJobId, {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : String(error),
          errorDetails: error instanceof Error ? error.stack : undefined,
        });
      }

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

  private separateCustomFieldMappings(mapping: ColumnMapping): {
    staticMapping: ColumnMapping;
    customFieldsMapping: ColumnMapping;
  } {
    const staticMapping: ColumnMapping = {};
    const customFieldsMapping: ColumnMapping = {};

    for (const [key, value] of Object.entries(mapping)) {
      if (key.startsWith('customFields.')) {
        customFieldsMapping[key] = value;
      } else {
        staticMapping[key] = value;
      }
    }

    return { staticMapping, customFieldsMapping };
  }

  private async updateBatch(
    table: SupportedTable,
    rows: { id: string; values: Record<string, unknown> }[],
  ) {
    if (rows.length === 0) {
      return;
    }

    await this.db.transaction(async (tx) => {
      for (const { id, values } of rows) {
        const { organizationId, customFields, ...setValues } = values as {
          organizationId?: string;
          customFields?: Record<string, unknown>;
        };

        if (
          typeof organizationId !== 'string' ||
          Object.keys(setValues).length === 0
        ) {
          continue;
        }

        // Fetch existing record to merge custom fields
        let finalValues = setValues;
        if (customFields && Object.keys(customFields).length > 0) {
          const existing = await tx
            .select()
            .from(table)
            .where(
              and(eq(table.id, id), eq(table.organizationId, organizationId)),
            )
            .limit(1);

          if (existing.length > 0) {
            const existingCustomFields =
              (
                existing[0] as {
                  customFields?: Record<string, unknown>;
                }
              ).customFields ?? {};
            // Merge: new custom fields override existing ones
            finalValues = {
              ...setValues,
              customFields: { ...existingCustomFields, ...customFields },
            } as Record<string, unknown>;
          } else {
            finalValues = { ...setValues, customFields } as Record<
              string,
              unknown
            >;
          }
        }

        await tx
          .update(table)
          .set(finalValues as never)
          .where(
            and(eq(table.id, id), eq(table.organizationId, organizationId)),
          );
      }
    });
  }
}
