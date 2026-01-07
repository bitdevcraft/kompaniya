import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  type CustomFieldDefinition,
  customFieldDefinitionsTable,
  type NewCustomFieldDefinition,
} from '@repo/database/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';

import { CacheService } from '../cache/cache.service';

const MAX_FIELDS_PER_ENTITY_TYPE = 100;

@Injectable()
export class CustomFieldDefinitionsService {
  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new custom field definition
   */
  async create(
    organizationId: string,
    definition: Omit<NewCustomFieldDefinition, 'organizationId'>,
  ): Promise<CustomFieldDefinition> {
    // Validate key format
    if (!this.isValidKey(definition.key)) {
      throw new BadRequestException(
        'Invalid key format. Use alphanumeric, underscores, hyphens (1-50 chars)',
      );
    }

    // Check if key is reserved
    if (this.isReservedKey(definition.key)) {
      throw new BadRequestException(
        "Reserved key namespace. Keys starting with '_' are reserved",
      );
    }

    // Check field count limit
    const count = await this.getFieldCount(
      organizationId,
      definition.entityType,
    );
    if (count >= MAX_FIELDS_PER_ENTITY_TYPE) {
      throw new BadRequestException(
        `Maximum fields per entity type reached (${MAX_FIELDS_PER_ENTITY_TYPE})`,
      );
    }

    // Check uniqueness
    const existing = await this.db
      .select()
      .from(customFieldDefinitionsTable)
      .where(
        and(
          eq(customFieldDefinitionsTable.organizationId, organizationId),
          eq(customFieldDefinitionsTable.entityType, definition.entityType),
          eq(customFieldDefinitionsTable.key, definition.key),
          eq(customFieldDefinitionsTable.isDeleted, false),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException(
        'Field key already exists for this entity type',
      );
    }

    // Validate choices for select fields
    if (
      (definition.fieldType === 'single_select' ||
        definition.fieldType === 'multi_select') &&
      (!definition.choices || definition.choices.length === 0)
    ) {
      throw new BadRequestException(
        'Choices are required for single_select and multi_select field types',
      );
    }

    // Insert
    const result = await this.db
      .insert(customFieldDefinitionsTable)
      .values({
        ...definition,
        organizationId,
      })
      .returning();

    const created = result[0];
    if (!created) {
      throw new Error('Failed to create custom field definition');
    }

    // Invalidate cache
    await this.invalidateCache(organizationId, definition.entityType);

    return created;
  }

  /**
   * Soft delete a field definition
   */
  async delete(organizationId: string, id: string): Promise<void> {
    const result = await this.db
      .update(customFieldDefinitionsTable)
      .set({ isDeleted: true })
      .where(
        and(
          eq(customFieldDefinitionsTable.id, id),
          eq(customFieldDefinitionsTable.organizationId, organizationId),
        ),
      )
      .returning();

    const deleted = result[0];
    if (!deleted) {
      throw new NotFoundException('Field definition not found');
    }

    // Invalidate cache
    await this.invalidateCache(organizationId, deleted.entityType);
  }

  /**
   * Get all field definitions for an entity type (cached)
   */
  async getByEntityType(
    organizationId: string,
    entityType: string,
  ): Promise<CustomFieldDefinition[]> {
    const cacheKey = Keys.CustomField.definitionsByEntity(
      organizationId,
      entityType,
    );

    const result = await this.cacheService.wrapCache<CustomFieldDefinition[]>({
      key: cacheKey,
      fn: async () => {
        return await this.db
          .select()
          .from(customFieldDefinitionsTable)
          .where(
            and(
              eq(customFieldDefinitionsTable.organizationId, organizationId),
              eq(customFieldDefinitionsTable.entityType, entityType),
              eq(customFieldDefinitionsTable.isDeleted, false),
            ),
          )
          .orderBy(desc(customFieldDefinitionsTable.createdAt));
      },
    });

    return result ?? [];
  }

  /**
   * Get field definition by ID
   */
  async getById(
    organizationId: string,
    id: string,
  ): Promise<CustomFieldDefinition | undefined> {
    const result = await this.db
      .select()
      .from(customFieldDefinitionsTable)
      .where(
        and(
          eq(customFieldDefinitionsTable.id, id),
          eq(customFieldDefinitionsTable.organizationId, organizationId),
          eq(customFieldDefinitionsTable.isDeleted, false),
        ),
      )
      .limit(1);

    return result[0];
  }

  /**
   * Get single field definition by key
   */
  async getByKey(
    organizationId: string,
    entityType: string,
    key: string,
  ): Promise<CustomFieldDefinition | undefined> {
    const definitions = await this.getByEntityType(organizationId, entityType);
    return definitions.find((d) => d.key === key);
  }

  /**
   * Update a custom field definition
   * Note: key cannot be changed after creation
   */
  async update(
    organizationId: string,
    id: string,
    updates: Partial<Omit<NewCustomFieldDefinition, 'organizationId' | 'key'>>,
  ): Promise<CustomFieldDefinition> {
    // Get existing definition
    const existing = await this.db
      .select()
      .from(customFieldDefinitionsTable)
      .where(
        and(
          eq(customFieldDefinitionsTable.id, id),
          eq(customFieldDefinitionsTable.organizationId, organizationId),
          eq(customFieldDefinitionsTable.isDeleted, false),
        ),
      )
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundException('Field definition not found');
    }

    const definition = existing[0]!;

    // Validate choices for select fields
    if (
      updates.choices !== undefined &&
      (definition.fieldType === 'single_select' ||
        definition.fieldType === 'multi_select') &&
      (!updates.choices || updates.choices.length === 0)
    ) {
      throw new BadRequestException(
        'Choices are required for single_select and multi_select field types',
      );
    }

    const result = await this.db
      .update(customFieldDefinitionsTable)
      .set(updates)
      .where(
        and(
          eq(customFieldDefinitionsTable.id, id),
          eq(customFieldDefinitionsTable.organizationId, organizationId),
        ),
      )
      .returning();

    const updated = result[0];
    if (!updated) {
      throw new NotFoundException('Field definition not found');
    }

    // Invalidate cache
    await this.invalidateCache(organizationId, updated.entityType);

    return updated;
  }

  /**
   * Get count of active fields for an entity type
   */
  private async getFieldCount(
    organizationId: string,
    entityType: string,
  ): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(customFieldDefinitionsTable)
      .where(
        and(
          eq(customFieldDefinitionsTable.organizationId, organizationId),
          eq(customFieldDefinitionsTable.entityType, entityType),
          eq(customFieldDefinitionsTable.isDeleted, false),
        ),
      );

    return result[0]?.count ?? 0;
  }

  /**
   * Invalidate cache for entity type
   */
  private async invalidateCache(
    organizationId: string,
    entityType: string,
  ): Promise<void> {
    const cacheKey = Keys.CustomField.definitionsByEntity(
      organizationId,
      entityType,
    );
    await this.cacheService.delete(cacheKey);
  }

  /**
   * Check if key is reserved
   * Keys starting with '_' are reserved for system use
   */
  private isReservedKey(key: string): boolean {
    return key.startsWith('_');
  }

  /**
   * Validate key format
   * Alphanumeric, underscores, hyphens, max 50 chars
   */
  private isValidKey(key: string): boolean {
    return /^[a-zA-Z0-9_-]{1,50}$/.test(key);
  }
}
