import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { customFieldDefinitionsTable } from '@repo/database/schema';
import {
  getEntityReferenceConfig,
  ORIGINAL_REFERENCE_FIELDS,
  type RecordLayoutEntityType,
} from '@repo/domain';
import { and, eq, sql } from 'drizzle-orm';

import { DRIZZLE_DB } from '~/constants/provider';

export interface ReferenceFieldDescriptor {
  sourceEntityType: RecordLayoutEntityType;
  fieldName: string;
  fieldType: 'original' | 'custom';
  label: string;
  apiPath: string;
  recordPath: string;
}

@Injectable()
export class ReferenceDiscoveryService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: Db) {}

  async findReferencingEntities(
    targetType: RecordLayoutEntityType,
    organizationId: string,
  ): Promise<ReferenceFieldDescriptor[]> {
    const results: ReferenceFieldDescriptor[] = [];

    const originalRefs = ORIGINAL_REFERENCE_FIELDS[targetType] || [];
    results.push(
      ...originalRefs.map((ref) => ({
        ...ref,
        fieldType: 'original' as const,
      })),
    );

    const customRefs = await this.db
      .select()
      .from(customFieldDefinitionsTable)
      .where(
        and(
          eq(customFieldDefinitionsTable.organizationId, organizationId),
          eq(customFieldDefinitionsTable.fieldType, 'reference'),
          eq(customFieldDefinitionsTable.isDeleted, false),
          sql`${customFieldDefinitionsTable.referenceConfig} ->> 'targetType' = ${targetType}`,
        ),
      );

    for (const field of customRefs) {
      const entityConfig = getEntityReferenceConfig(
        field.entityType as RecordLayoutEntityType,
      );
      if (!entityConfig) {
        continue;
      }

      results.push({
        sourceEntityType: field.entityType as RecordLayoutEntityType,
        fieldName: field.key,
        fieldType: 'custom',
        label: field.label,
        apiPath: entityConfig.apiPath,
        recordPath: entityConfig.recordPath,
      });
    }

    return results;
  }
}
