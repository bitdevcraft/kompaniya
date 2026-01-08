import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type Db,
  DEFAULT_RECORD_LAYOUTS,
  type OrgRecordLayout,
  type RecordLayoutEntityType,
  type RecordLayoutHeader,
  type RecordLayoutSectionColumns,
} from '@repo/database';
import { orgRecordLayoutsTable } from '@repo/database/schema';
import { and, eq } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';

import { CacheService } from '../cache/cache.service';
import { CustomFieldDefinitionsService } from '../custom-fields/custom-field-definitions.service';

/**
 * Mapping from custom field types to layout field types
 */
const CUSTOM_FIELD_TYPE_MAPPING: Record<string, string> = {
  string: 'text',
  number: 'number',
  boolean: 'boolean',
  date: 'date',
  datetime: 'datetime',
  single_select: 'picklist',
  multi_select: 'multipicklist',
  json: 'textarea',
  reference: 'lookup',
};

@Injectable()
export class RecordLayoutsService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
    private readonly customFieldService: CustomFieldDefinitionsService,
  ) {}

  /**
   * Get all layouts for an organization
   */
  async getAllLayouts(organizationId: string): Promise<unknown[]> {
    const layouts = await this.db
      .select()
      .from(orgRecordLayoutsTable)
      .where(
        and(
          eq(orgRecordLayoutsTable.organizationId, organizationId),
          eq(orgRecordLayoutsTable.isDeleted, false),
        ),
      );

    return layouts as unknown[];
  }

  /**
   * Get layout for organization and entity type
   * Returns customized layout if exists, otherwise returns default
   */
  async getLayout(
    organizationId: string,
    entityType: string,
  ): Promise<unknown> {
    const cacheKey = Keys.RecordLayout.layout(organizationId, entityType);

    const result = await this.cacheService.wrapCache<unknown>({
      key: cacheKey,
      fn: async () => {
        // Try to get customized layout
        const custom = await this.db
          .select()
          .from(orgRecordLayoutsTable)
          .where(
            and(
              eq(orgRecordLayoutsTable.organizationId, organizationId),
              eq(
                orgRecordLayoutsTable.entityType,
                entityType as RecordLayoutEntityType,
              ),
              eq(orgRecordLayoutsTable.isDeleted, false),
            ),
          )
          .limit(1);

        if (custom.length > 0) {
          return this.mergeLayoutWithCustomFields(
            organizationId,
            entityType,
            custom[0]!,
          );
        }

        // Return default layout
        return this.getDefaultLayout(entityType);
      },
    });

    return result ?? this.getDefaultLayout(entityType);
  }

  /**
   * Reset layout to default
   */
  async resetToDefault(
    organizationId: string,
    entityType: string,
  ): Promise<{ success: boolean }> {
    const existing = await this.db
      .select()
      .from(orgRecordLayoutsTable)
      .where(
        and(
          eq(orgRecordLayoutsTable.organizationId, organizationId),
          eq(
            orgRecordLayoutsTable.entityType,
            entityType as RecordLayoutEntityType,
          ),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Layout not found');
    }

    await this.db
      .update(orgRecordLayoutsTable)
      .set({ isDeleted: true })
      .where(eq(orgRecordLayoutsTable.id, existing[0]!.id));

    await this.invalidateCache(organizationId, entityType);

    return { success: true };
  }

  /**
   * Create or update a custom layout
   */
  async upsertLayout(
    organizationId: string,
    entityType: string,
    layout: {
      header: unknown;
      sectionColumns?: unknown;
      sections?: unknown[];
      supplementalFields?: unknown[];
      autoIncludeCustomFields?: boolean;
    },
    userId: string,
  ): Promise<unknown> {
    const existing = await this.db
      .select()
      .from(orgRecordLayoutsTable)
      .where(
        and(
          eq(orgRecordLayoutsTable.organizationId, organizationId),
          eq(
            orgRecordLayoutsTable.entityType,
            entityType as RecordLayoutEntityType,
          ),
          eq(orgRecordLayoutsTable.isDeleted, false),
        ),
      )
      .limit(1);

    const now = new Date();

    let result: OrgRecordLayout[];
    if (existing.length > 0) {
      result = await this.db
        .update(orgRecordLayoutsTable)
        .set({
          header: layout.header as RecordLayoutHeader,
          sectionColumns:
            layout.sectionColumns as RecordLayoutSectionColumns | null,
          sections: layout.sections as unknown[] | null,
          supplementalFields: layout.supplementalFields as unknown[] | null,
          autoIncludeCustomFields: layout.autoIncludeCustomFields ?? true,
          isCustomized: true,
          updatedBy: userId,
          updatedAt: now,
        })
        .where(eq(orgRecordLayoutsTable.id, existing[0]!.id))
        .returning();
    } else {
      result = await this.db
        .insert(orgRecordLayoutsTable)
        .values({
          organizationId,
          entityType: entityType as RecordLayoutEntityType,
          createdBy: userId,
          updatedBy: userId,
          header: layout.header as RecordLayoutHeader,
          sectionColumns:
            layout.sectionColumns as RecordLayoutSectionColumns | null,
          sections: layout.sections as unknown[] | null,
          supplementalFields: layout.supplementalFields as unknown[] | null,
          autoIncludeCustomFields: layout.autoIncludeCustomFields ?? true,
          isCustomized: true,
        })
        .returning();
    }

    // Invalidate cache
    await this.invalidateCache(organizationId, entityType);

    return result[0];
  }

  /**
   * Get default layout (TypeScript definition)
   */
  private getDefaultLayout(entityType: string): unknown {
    const defaultLayout =
      DEFAULT_RECORD_LAYOUTS[entityType as keyof typeof DEFAULT_RECORD_LAYOUTS];
    if (!defaultLayout) {
      // Return a minimal default layout for unknown entity types
      return {
        header: {
          title: { fieldId: 'name', fallback: 'Untitled record' },
          metadata: [
            {
              fieldId: 'createdAt',
              id: 'created-at',
              label: 'Created',
              type: 'datetime',
            },
            {
              fieldId: 'updatedAt',
              id: 'updated-at',
              label: 'Updated',
              type: 'datetime',
            },
          ],
        },
        sectionColumns: {
          header: {
            sections: [
              {
                id: 'overview',
                title: 'Overview',
                fields: [{ id: 'name', label: 'Name', type: 'text' }],
              },
            ],
          },
        },
        supplementalFields: [],
        isDefault: true,
        autoIncludeCustomFields: true,
      };
    }

    return {
      ...defaultLayout,
      isDefault: true,
      autoIncludeCustomFields: true,
    };
  }

  /**
   * Invalidate cache for entity type
   */
  private async invalidateCache(
    organizationId: string,
    entityType: string,
  ): Promise<void> {
    const cacheKey = Keys.RecordLayout.layout(organizationId, entityType);
    await this.cacheService.delete(cacheKey);
  }

  /**
   * Merge layout with custom field definitions if auto-include is enabled
   */
  private async mergeLayoutWithCustomFields(
    organizationId: string,
    entityType: string,
    layout: {
      autoIncludeCustomFields?: boolean;
      sections?: unknown[] | null;
      supplementalFields?: unknown[] | null;
      [key: string]: unknown;
    },
  ): Promise<unknown> {
    if (!layout.autoIncludeCustomFields) {
      return layout;
    }

    const customFields = await this.customFieldService.getByEntityType(
      organizationId,
      entityType,
    );

    if (customFields.length === 0) {
      return layout;
    }

    // Convert custom field definitions to RecordLayoutField format
    const customFieldLayouts = customFields.map((cf) => ({
      id: `customFields.${cf.key}`,
      label: cf.label,
      description: cf.description,
      type: CUSTOM_FIELD_TYPE_MAPPING[cf.fieldType] || 'text',
      required: cf.isRequired,
      options: cf.choices,
      readOnly: false,
    }));

    // Append to sections or add a new "Custom Fields" section
    const sections = layout.sections || [];
    const hasCustomFieldsSection = sections.some(
      (s: unknown) =>
        typeof s === 'object' &&
        s !== null &&
        (s as { id?: string }).id === 'custom-fields',
    );

    if (!hasCustomFieldsSection) {
      sections.push({
        id: 'custom-fields',
        title: 'Custom Fields',
        fields: customFieldLayouts,
      });
    }

    return {
      ...layout,
      sections,
    };
  }
}
