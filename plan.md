# Implementation Plan: Related Records Custom Components

## Overview

Create two custom components for the record layout builder that display **reverse lookup** relationships - records that reference the current record via reference fields (both original and custom).

### Components to Create

1. **related-records-single** - Shows related records from ONE entity type (user-configured)
2. **related-records-multi** - Shows ALL entity types that reference the current record in accordion sections

---

## Phase 1: Backend - Domain Layer

### File: `packages/domain/src/entities/original-reference-fields.ts` (NEW)

Create a hardcoded mapping of all original (schema-based) foreign key relationships:

```typescript
import type { RecordLayoutEntityType } from "./record-layout-entity-type.js";
import type { EntityReferenceConfig } from "./entity-reference-config.js";

export interface OriginalReferenceField {
  sourceEntityType: RecordLayoutEntityType;
  fieldName: string;
  label: string;
  apiPath: string;
  recordPath: string;
}

export const ORIGINAL_REFERENCE_FIELDS: Partial<
  Record<RecordLayoutEntityType, OriginalReferenceField[]>
> = {
  org_accounts: [
    {
      sourceEntityType: "org_opportunities",
      fieldName: "accountId",
      label: "Opportunities",
      apiPath: "opportunity",
      recordPath: "opportunities",
    },
  ],
  org_contacts: [
    {
      sourceEntityType: "org_opportunities",
      fieldName: "primaryContactId",
      label: "Opportunities (Primary)",
      apiPath: "opportunity",
      recordPath: "opportunities",
    },
    {
      sourceEntityType: "org_real_estate_booking_buyers",
      fieldName: "contactId",
      label: "Booking Buyers",
      apiPath: "booking-buyer",
      recordPath: "booking-buyers",
    },
    {
      sourceEntityType: "org_emails",
      fieldName: "crmContactId",
      label: "Emails",
      apiPath: "email",
      recordPath: "emails",
    },
  ],
  org_real_estate_projects: [
    {
      sourceEntityType: "org_real_estate_bookings",
      fieldName: "projectId",
      label: "Bookings",
      apiPath: "real-estate/booking",
      recordPath: "bookings",
    },
    {
      sourceEntityType: "org_real_estate_properties",
      fieldName: "projectId",
      label: "Properties",
      apiPath: "real-estate/property",
      recordPath: "properties",
    },
  ],
  org_real_estate_properties: [
    {
      sourceEntityType: "org_real_estate_bookings",
      fieldName: "propertyId",
      label: "Bookings",
      apiPath: "real-estate/booking",
      recordPath: "bookings",
    },
  ],
  org_payment_plans: [
    {
      sourceEntityType: "org_real_estate_bookings",
      fieldName: "paymentPlanId",
      label: "Bookings",
      apiPath: "real-estate/booking",
      recordPath: "bookings",
    },
  ],
  org_payment_plan_templates: [
    {
      sourceEntityType: "org_payment_plans",
      fieldName: "templateId",
      label: "Payment Plans",
      apiPath: "payment-plan",
      recordPath: "payment-plans",
    },
  ],
  org_real_estate_bookings: [
    {
      sourceEntityType: "org_real_estate_booking_buyers",
      fieldName: "bookingId",
      label: "Buyers",
      apiPath: "booking-buyer",
      recordPath: "booking-buyers",
    },
  ],
  org_email_campaigns: [
    {
      sourceEntityType: "org_emails",
      fieldName: "orgEmailCampaignId",
      label: "Emails",
      apiPath: "email",
      recordPath: "emails",
    },
  ],
  // Entities with no original references - empty arrays for completeness
  org_activities: [],
  org_categories: [],
  org_tags: [],
  org_tasks: [],
  org_events: [],
  org_leads: [],
  org_email_templates: [],
  org_email_domains: [],
  org_email_test_receivers: [],
  org_email_clicks: [],
};
```

---

## Phase 2: Backend - Reference Module

### File: `apps/api/src/modules/core/references/reference-discovery.service.ts` (NEW)

Service that discovers all reference fields (original + custom) that point to a given entity type:

```typescript
@Injectable()
export class ReferenceDiscoveryService {
  async findReferencingEntities(
    targetType: RecordLayoutEntityType,
    organizationId: string,
  ): Promise<ReferenceFieldDescriptor[]> {
    const results: ReferenceFieldDescriptor[] = [];

    // 1. Get original references from hardcoded map
    const originalRefs = ORIGINAL_REFERENCE_FIELDS[targetType] || [];
    results.push(
      ...originalRefs.map((ref) => ({
        ...ref,
        fieldType: "original" as const,
      })),
    );

    // 2. Get custom field references from database
    const customRefs = await this.db
      .select()
      .from(customFieldDefinitionsTable)
      .where(
        and(
          eq(customFieldDefinitionsTable.organizationId, organizationId),
          eq(customFieldDefinitionsTable.fieldType, "reference"),
          eq(customFieldDefinitionsTable.isDeleted, false),
          sql`reference_config->>'targetType' = ${targetType}`,
        ),
      );

    // 3. Map custom fields to descriptors
    for (const field of customRefs) {
      const entityConfig = getEntityReferenceConfig(
        field.entityType as RecordLayoutEntityType,
      );
      if (entityConfig) {
        results.push({
          sourceEntityType: field.entityType,
          fieldName: field.key,
          fieldType: "custom",
          label: field.label,
          apiPath: entityConfig.apiPath,
          recordPath: entityConfig.recordPath,
        });
      }
    }

    return results;
  }
}
```

### File: `apps/api/src/modules/core/references/related-records.service.ts` (NEW)

Service for querying related records with pagination:

```typescript
interface RelatedRecordsQuery {
  targetEntityType: RecordLayoutEntityType;
  targetRecordId: string;
  sourceEntityType: RecordLayoutEntityType;
  fieldName: string;
  fieldType: "original" | "custom";
  page: number;
  perPage: number;
  organizationId: string;
}

interface RelatedRecordsResponse<T = unknown> {
  entityType: string;
  entityLabel: string;
  fieldUsed: string;
  fieldLabel: string;
  apiPath: string;
  recordPath: string;
  data: T[];
  pageCount: number;
  totalCount: number;
}

@Injectable()
export class RelatedRecordsService {
  async getRelatedRecords<T>(
    query: RelatedRecordsQuery,
  ): Promise<RelatedRecordsResponse<T>> {
    // Build query based on fieldType
    // For original: eq(table[fieldName], targetRecordId)
    // For custom: sql`custom_fields->>${fieldName}->>'id' = ${targetRecordId}`
    // Use existing PaginationRepositoryService pattern
  }

  async getRelatedRecordCount(/* similar params */): Promise<number> {
    // Return count for display in headers
  }
}
```

### File: `apps/api/src/modules/core/references/references.controller.ts` (NEW)

Controller exposing API endpoints:

```typescript
@Controller("references")
export class ReferencesController {
  @Get("discover")
  async discoverReferences(
    @Query("entityType") entityType: RecordLayoutEntityType,
    @ActiveOrganization() organization: Organization,
  ) {
    return this.referenceDiscoveryService.findReferencingEntities(
      entityType,
      organization.id,
    );
  }

  @Get("related")
  async getRelatedRecords(
    @Query("targetEntityType") targetType: RecordLayoutEntityType,
    @Query("targetRecordId") targetRecordId: string,
    @Query("sourceEntityType") sourceEntityType: RecordLayoutEntityType,
    @Query("fieldName") fieldName: string,
    @Query("fieldType") fieldType: "original" | "custom",
    @Query("page") page: number = 1,
    @Query("perPage") perPage: number = 10,
    @ActiveOrganization() organization: Organization,
  ) {
    return this.relatedRecordsService.getRelatedRecords({
      targetEntityType,
      targetRecordId,
      sourceEntityType,
      fieldName,
      fieldType,
      page,
      perPage,
      organizationId: organization.id,
    });
  }
}
```

### File: `apps/api/src/modules/core/references/references.module.ts` (NEW)

NestJS module wiring everything together.

---

## Phase 3: Frontend Components

### File: `apps/web/src/components/custom-components/related-records-single.tsx` (NEW)

Single entity type related records component:

```typescript
interface RelatedRecordsSingleConfig {
  title?: string;
  sourceEntityType: string; // Required: which entity to show
  perPage?: number;
  showEmpty?: boolean;
}

export function RelatedRecordsSingle({
  entityType,
  recordId,
  config,
}: CustomComponentProps) {
  const { sourceEntityType, perPage = 10, title } = parseConfig(config);

  const { data, isLoading, error } = useQuery({
    queryKey: ['related-records-single', entityType, recordId, sourceEntityType],
    queryFn: () => fetchRelatedRecords({ ... }),
    enabled: !!sourceEntityType,
  });

  // Render Card with paginated table
}
```

### File: `apps/web/src/components/custom-components/related-records-multi.tsx` (NEW)

Multi-entity accordion component:

```typescript
interface RelatedRecordsMultiConfig {
  title?: string;
  perPage?: number;
  defaultExpanded?: string[];
  showEmptySections?: boolean;
}

export function RelatedRecordsMulti({
  entityType,
  recordId,
  config,
}: CustomComponentProps) {
  // Discover all referencing entities
  const { data: referencingEntities } = useQuery({
    queryKey: ["related-entities", entityType],
    queryFn: () =>
      fetch(`/api/organization/references/discover?entityType=${entityType}`),
  });

  // Render Collapsible sections for each entity type
  // Each section has its own paginated table
}
```

### File: `apps/web/src/components/custom-components/related-records-section.tsx` (NEW)

Shared sub-component for rendering a collapsible section with related records table:

```typescript
interface RelatedRecordsSectionProps {
  sourceEntityType: string;
  targetEntityType: string;
  targetRecordId: string;
  fieldName: string;
  fieldType: 'original' | 'custom';
  label: string;
  perPage: number;
}

export function RelatedRecordsSection({ ... }: RelatedRecordsSectionProps) {
  // Collapsible with header showing count
  // Paginated table with navigation
}
```

---

## Phase 4: Component Registration

### File: `apps/web/src/lib/component-definitions/registrations.ts` (EDIT)

Add component definitions and registrations:

```typescript
const RELATED_RECORDS_SINGLE_DEFINITION: CustomComponentDefinition = {
  id: "related-records-single",
  label: "Related Records (Single)",
  description:
    "Shows related records from one entity type that references this record",
  category: "organization",
  iconName: "Link",
  entityTypes: [], // Works for all entities
  props: {
    title: "Related Records",
    sourceEntityType: "", // User must configure this
    perPage: 10,
  },
};

const RELATED_RECORDS_MULTI_DEFINITION: CustomComponentDefinition = {
  id: "related-records-multi",
  label: "Related Records (All)",
  description: "Shows all entity types that reference this record",
  category: "organization",
  iconName: "Network",
  entityTypes: [], // Works for all entities
  props: {
    title: "Related Records",
    perPage: 5,
    defaultExpanded: [],
  },
};

export function registerAllCustomComponents() {
  // ... existing registrations
  registerComponent(RELATED_RECORDS_SINGLE_DEFINITION, RelatedRecordsSingle);
  registerComponent(RELATED_RECORDS_MULTI_DEFINITION, RelatedRecordsMulti);
}
```

---

## Critical Files Summary

| File                                                                    | Action | Purpose                                            |
| ----------------------------------------------------------------------- | ------ | -------------------------------------------------- |
| `packages/domain/src/entities/original-reference-fields.ts`             | NEW    | Hardcoded map of original FK relationships         |
| `apps/api/src/modules/core/references/reference-discovery.service.ts`   | NEW    | Discovers referencing entities (original + custom) |
| `apps/api/src/modules/core/references/related-records.service.ts`       | NEW    | Queries related records with pagination            |
| `apps/api/src/modules/core/references/references.controller.ts`         | NEW    | API endpoints for discover and related queries     |
| `apps/api/src/modules/core/references/references.module.ts`             | NEW    | NestJS module                                      |
| `apps/web/src/components/custom-components/related-records-single.tsx`  | NEW    | Single entity component                            |
| `apps/web/src/components/custom-components/related-records-multi.tsx`   | NEW    | Multi-entity accordion component                   |
| `apps/web/src/components/custom-components/related-records-section.tsx` | NEW    | Shared section component                           |
| `apps/web/src/lib/component-definitions/registrations.ts`               | EDIT   | Register new components                            |

---

## Verification

### Manual Testing Steps

1. **Test Discovery API**: Visit `/api/organization/references/discover?entityType=org_accounts` - should return entities like Opportunities

2. **Test Related Records API**: Visit `/api/organization/references/related?targetEntityType=org_accounts&targetRecordId={id}&sourceEntityType=org_opportunities&fieldName=accountId&fieldType=original` - should return paginated opportunities

3. **Test Single Component**:
   - Add "Related Records (Single)" to Account layout
   - Configure `sourceEntityType: org_opportunities`
   - View an Account - should see Opportunities that reference it

4. **Test Multi Component**:
   - Add "Related Records (All)" to Account layout
   - View an Account - should see collapsible sections for each referencing entity

5. **Test Custom Fields**:
   - Create a custom reference field on any entity pointing to another
   - Verify the related records appear in the multi component

6. **Test Pagination**: Verify each section has working pagination controls
