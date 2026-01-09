import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  type Db,
  DEFAULT_TABLE_COLUMN_PREFERENCES,
  type DefaultTablePreferenceEntityType,
  getDefaultTableColumnPreferences,
} from '@repo/database';
import {
  type ColumnVisibilityState,
  orgUserTablePreferencesTable,
  type TablePreferencesEntityType,
  type UserTablePreferences,
} from '@repo/database/schema';
import { and, desc, eq } from 'drizzle-orm';

import { DRIZZLE_DB } from '~/constants/provider';

const VALID_ENTITY_TYPES = new Set(
  Object.keys(
    DEFAULT_TABLE_COLUMN_PREFERENCES,
  ) as DefaultTablePreferenceEntityType[],
);

export type TablePreferencesPayload = {
  entityType: TablePreferencesEntityType;
  preferences: UserTablePreferences;
  isCustomized: boolean;
  isDefault: boolean;
};

@Injectable()
export class TablePreferencesService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: Db) {}

  async getPreferences(
    organizationId: string,
    userId: string,
    entityType: string,
  ): Promise<TablePreferencesPayload> {
    const typedEntityType = this.assertEntityType(entityType);
    const defaults = getDefaultTableColumnPreferences(typedEntityType);

    const existing = await this.getLatestPreference(
      organizationId,
      userId,
      typedEntityType,
    );

    if (!existing) {
      return {
        entityType: typedEntityType,
        preferences: defaults,
        isCustomized: false,
        isDefault: true,
      };
    }

    const visibility = this.normalizeVisibility(
      typedEntityType,
      existing.preferences.visibility,
    );

    return {
      entityType: typedEntityType,
      preferences: {
        visibility,
        order: existing.preferences.order ?? defaults.order,
        pinning: existing.preferences.pinning ?? defaults.pinning,
      },
      isCustomized: existing.isCustomized,
      isDefault: false,
    };
  }

  async updateVisibility(
    organizationId: string,
    userId: string,
    entityType: string,
    visibility: ColumnVisibilityState,
  ): Promise<TablePreferencesPayload> {
    const typedEntityType = this.assertEntityType(entityType);
    const defaults = getDefaultTableColumnPreferences(typedEntityType);
    const normalizedVisibility = this.normalizeVisibility(
      typedEntityType,
      visibility,
    );

    const existing = await this.getLatestPreference(
      organizationId,
      userId,
      typedEntityType,
    );

    const preferences: UserTablePreferences = {
      visibility: normalizedVisibility,
      order: existing?.preferences.order ?? defaults.order,
      pinning: existing?.preferences.pinning ?? defaults.pinning,
    };

    const now = new Date();

    if (existing) {
      await this.db
        .update(orgUserTablePreferencesTable)
        .set({
          preferences,
          isCustomized: true,
          updatedAt: now,
        })
        .where(eq(orgUserTablePreferencesTable.id, existing.id))
        .returning();
    } else {
      await this.db
        .insert(orgUserTablePreferencesTable)
        .values({
          organizationId,
          userId,
          entityType: typedEntityType,
          preferences,
          isCustomized: true,
        })
        .returning();
    }

    return {
      entityType: typedEntityType,
      preferences,
      isCustomized: true,
      isDefault: false,
    };
  }

  private assertEntityType(entityType: string): TablePreferencesEntityType {
    if (
      !VALID_ENTITY_TYPES.has(entityType as DefaultTablePreferenceEntityType)
    ) {
      throw new BadRequestException('Invalid table preferences entity type');
    }

    return entityType as TablePreferencesEntityType;
  }

  private async getLatestPreference(
    organizationId: string,
    userId: string,
    entityType: TablePreferencesEntityType,
  ) {
    const results = await this.db
      .select()
      .from(orgUserTablePreferencesTable)
      .where(
        and(
          eq(orgUserTablePreferencesTable.organizationId, organizationId),
          eq(orgUserTablePreferencesTable.userId, userId),
          eq(orgUserTablePreferencesTable.entityType, entityType),
          eq(orgUserTablePreferencesTable.isDeleted, false),
        ),
      )
      .orderBy(desc(orgUserTablePreferencesTable.updatedAt))
      .limit(1);

    return results[0];
  }

  private normalizeVisibility(
    entityType: DefaultTablePreferenceEntityType,
    visibility: ColumnVisibilityState,
  ): ColumnVisibilityState {
    const defaults = getDefaultTableColumnPreferences(entityType);
    const normalized: ColumnVisibilityState = {
      ...defaults.visibility,
      ...visibility,
    };

    if ('name' in defaults.visibility) {
      normalized.name = true;
    }

    return normalized;
  }
}
