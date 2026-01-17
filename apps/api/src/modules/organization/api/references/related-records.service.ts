import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  customFieldDefinitionsTable,
  orgAccountsTable,
  orgActivitiesTable,
  orgCategoriesTable,
  orgContactsTable,
  orgEmailCampaignsTable,
  orgEmailClicksTable,
  orgEmailDomainsTable,
  orgEmailsTable,
  orgEmailTemplatesTable,
  orgEmailTestReceiversTable,
  orgEventsTable,
  orgLeadsTable,
  orgOpportunitiesTable,
  orgPaymentPlansTable,
  orgPaymentPlanTemplatesTable,
  orgRealEstateBookingBuyersTable,
  orgRealEstateBookingsTable,
  orgRealEstateProjectsTable,
  orgRealEstatePropertiesTable,
  orgTagsTable,
  orgTasksTable,
} from '@repo/database/schema';
import {
  getEntityReferenceConfig,
  ORIGINAL_REFERENCE_FIELDS,
  type RecordLayoutEntityType,
} from '@repo/domain';
import { and, asc, count, eq, isNull, sql, type Table } from 'drizzle-orm';
import { type AnyPgColumn, type AnyPgTable } from 'drizzle-orm/pg-core';

import { DRIZZLE_DB } from '~/constants/provider';

export interface RelatedRecordsQuery {
  targetEntityType: RecordLayoutEntityType;
  targetRecordId: string;
  sourceEntityType: RecordLayoutEntityType;
  fieldName: string;
  fieldType: 'original' | 'custom';
  page: number;
  perPage: number;
  organizationId: string;
}

export interface RelatedRecordsResponse<T = unknown> {
  entityType: RecordLayoutEntityType;
  entityLabel: string;
  fieldUsed: string;
  fieldLabel: string;
  apiPath: string;
  recordPath: string;
  data: T[];
  pageCount: number;
  totalCount: number;
}

const ENTITY_TABLES: Record<RecordLayoutEntityType, AnyPgTable> = {
  org_accounts: orgAccountsTable,
  org_activities: orgActivitiesTable,
  org_categories: orgCategoriesTable,
  org_contacts: orgContactsTable,
  org_email_campaigns: orgEmailCampaignsTable,
  org_email_clicks: orgEmailClicksTable,
  org_email_domains: orgEmailDomainsTable,
  org_email_templates: orgEmailTemplatesTable,
  org_email_test_receivers: orgEmailTestReceiversTable,
  org_emails: orgEmailsTable,
  org_events: orgEventsTable,
  org_leads: orgLeadsTable,
  org_opportunities: orgOpportunitiesTable,
  org_payment_plan_templates: orgPaymentPlanTemplatesTable,
  org_payment_plans: orgPaymentPlansTable,
  org_real_estate_booking_buyers: orgRealEstateBookingBuyersTable,
  org_real_estate_bookings: orgRealEstateBookingsTable,
  org_real_estate_projects: orgRealEstateProjectsTable,
  org_real_estate_properties: orgRealEstatePropertiesTable,
  org_tags: orgTagsTable,
  org_tasks: orgTasksTable,
};

@Injectable()
export class RelatedRecordsService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: Db) {}

  async getRelatedRecords<T>(
    query: RelatedRecordsQuery,
  ): Promise<RelatedRecordsResponse<T>> {
    const {
      targetEntityType,
      targetRecordId,
      sourceEntityType,
      fieldName,
      fieldType,
      organizationId,
    } = query;

    if (!targetRecordId) {
      throw new BadRequestException('Target record ID is required');
    }
    if (!fieldName) {
      throw new BadRequestException('Field name is required');
    }
    if (fieldType !== 'original' && fieldType !== 'custom') {
      throw new BadRequestException('Invalid field type');
    }
    if (fieldType === 'original') {
      const isKnownReference =
        ORIGINAL_REFERENCE_FIELDS[targetEntityType]?.some(
          (reference) =>
            reference.sourceEntityType === sourceEntityType &&
            reference.fieldName === fieldName,
        ) ?? false;
      if (!isKnownReference) {
        throw new BadRequestException('Unknown reference field');
      }
    }

    const table = this.getTable(sourceEntityType);
    const referenceCondition = this.buildReferenceCondition({
      table,
      fieldName,
      fieldType,
      targetRecordId,
    });

    const organizationIdColumn = (
      table as unknown as Record<string, AnyPgColumn>
    ).organizationId;
    const deletedAtColumn = (table as unknown as Record<string, AnyPgColumn>)
      .deletedAt;
    const createdAtColumn = (table as unknown as Record<string, AnyPgColumn>)
      .createdAt;
    if (!createdAtColumn) {
      throw new BadRequestException('Entity does not support createdAt');
    }

    const where = and(
      referenceCondition,
      organizationIdColumn
        ? eq(organizationIdColumn, organizationId)
        : undefined,
      deletedAtColumn ? isNull(deletedAtColumn) : undefined,
    );

    const normalizedPerPage = Math.max(1, query.perPage);
    const normalizedPage = Math.max(1, query.page);
    const offset = (normalizedPage - 1) * normalizedPerPage;

    const data = (await this.db
      .select()
      .from(table as unknown as Table)
      .where(where)
      .limit(normalizedPerPage)
      .offset(offset)
      .orderBy(asc(createdAtColumn))) as T[];

    const totalResult = await this.db
      .select({ count: count() })
      .from(table as unknown as Table)
      .where(where);

    const totalCount = Number(totalResult[0]?.count ?? 0);
    const pageCount = Math.ceil(totalCount / normalizedPerPage);

    const entityConfig = getEntityReferenceConfig(sourceEntityType);
    if (!entityConfig) {
      throw new BadRequestException('Unknown entity type');
    }

    const fieldLabel = await this.resolveFieldLabel({
      targetEntityType,
      sourceEntityType,
      fieldName,
      fieldType,
      organizationId,
    });

    return {
      entityType: sourceEntityType,
      entityLabel: entityConfig.label,
      fieldUsed: fieldName,
      fieldLabel,
      apiPath: entityConfig.apiPath,
      recordPath: entityConfig.recordPath,
      data,
      pageCount,
      totalCount,
    };
  }

  private buildReferenceCondition({
    table,
    fieldName,
    fieldType,
    targetRecordId,
  }: {
    table: AnyPgTable;
    fieldName: string;
    fieldType: 'original' | 'custom';
    targetRecordId: string;
  }) {
    if (fieldType === 'original') {
      const column = (table as unknown as Record<string, AnyPgColumn>)[
        fieldName
      ];
      if (!column) {
        throw new BadRequestException('Invalid reference field');
      }
      return eq(column, targetRecordId);
    }

    if (!this.isValidCustomFieldKey(fieldName)) {
      throw new BadRequestException('Invalid custom field key');
    }

    const customFieldsColumn = (table as unknown as Record<string, unknown>)
      .customFields;
    if (!customFieldsColumn) {
      throw new BadRequestException('Entity does not support custom fields');
    }

    return sql`${customFieldsColumn}->>${sql.raw(`'${fieldName}'`)} = ${targetRecordId}`;
  }

  private getTable(entityType: RecordLayoutEntityType): AnyPgTable {
    const table = ENTITY_TABLES[entityType];
    if (!table) {
      throw new BadRequestException('Unsupported entity type');
    }
    return table;
  }

  private isValidCustomFieldKey(key: string): boolean {
    return /^[a-zA-Z0-9_-]{1,50}$/.test(key);
  }

  private async resolveFieldLabel({
    targetEntityType,
    sourceEntityType,
    fieldName,
    fieldType,
    organizationId,
  }: {
    targetEntityType: RecordLayoutEntityType;
    sourceEntityType: RecordLayoutEntityType;
    fieldName: string;
    fieldType: 'original' | 'custom';
    organizationId: string;
  }): Promise<string> {
    if (fieldType === 'original') {
      const entry =
        ORIGINAL_REFERENCE_FIELDS[targetEntityType]?.find(
          (reference) =>
            reference.sourceEntityType === sourceEntityType &&
            reference.fieldName === fieldName,
        ) ?? null;
      return entry?.label ?? fieldName;
    }

    const customField = await this.db
      .select()
      .from(customFieldDefinitionsTable)
      .where(
        and(
          eq(customFieldDefinitionsTable.organizationId, organizationId),
          eq(customFieldDefinitionsTable.entityType, sourceEntityType),
          eq(customFieldDefinitionsTable.key, fieldName),
          eq(customFieldDefinitionsTable.isDeleted, false),
        ),
      )
      .limit(1);

    return customField[0]?.label ?? fieldName;
  }
}
