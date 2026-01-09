import type { FieldValues } from "react-hook-form";

import { useMemo } from "react";

import { accountRecordLayout } from "@/app/(authenticated)/record/(crm)/accounts/account-record-layout";
import { activityRecordLayout } from "@/app/(authenticated)/record/(crm)/activities/r/[id]/activity-record-layout";
import { categoriesRecordLayout } from "@/app/(authenticated)/record/(crm)/categories/r/[id]/categories-record-layout";
import { contactRecordLayout } from "@/app/(authenticated)/record/(crm)/contacts/r/[id]/contact-record-layout";
import { eventsRecordLayout } from "@/app/(authenticated)/record/(crm)/events/r/[id]/events-record-layout";
import { leadRecordLayout } from "@/app/(authenticated)/record/(crm)/leads/r/[id]/lead-record-layout";
import { opportunityRecordLayout } from "@/app/(authenticated)/record/(crm)/opportunities/opportunity-record-layout";
import { tagsRecordLayout } from "@/app/(authenticated)/record/(crm)/tags/r/[id]/tags-record-layout";
import { tasksRecordLayout } from "@/app/(authenticated)/record/(crm)/tasks/r/[id]/tasks-record-layout";
import { emailCampaignRecordLayout } from "@/app/(authenticated)/record/(marketing)/email-campaigns/email-campaign-record-layout";
import { emailClicksRecordLayout } from "@/app/(authenticated)/record/(marketing)/email-clicks/r/[id]/email-clicks-record-layout";
import { emailDomainsRecordLayout } from "@/app/(authenticated)/record/(marketing)/email-domains/r/[id]/email-domains-record-layout";
import { emailTemplateRecordLayout } from "@/app/(authenticated)/record/(marketing)/email-templates/email-template-record-layout";
import { emailTestReceiverRecordLayout } from "@/app/(authenticated)/record/(marketing)/email-test-receivers/email-test-receiver-record-layout";
import { emailsRecordLayout } from "@/app/(authenticated)/record/(marketing)/emails/r/[id]/emails-record-layout";
import { bookingBuyersRecordLayout } from "@/app/(authenticated)/record/(real-estate)/booking-buyers/r/[id]/booking-buyers-record-layout";
import { bookingRecordLayout } from "@/app/(authenticated)/record/(real-estate)/bookings/r/[id]/booking-record-layout";
import { paymentPlanTemplateRecordLayout } from "@/app/(authenticated)/record/(real-estate)/payment-plan-templates/r/[id]/payment-plan-template-record-layout";
import { paymentPlanRecordLayout } from "@/app/(authenticated)/record/(real-estate)/payment-plans/r/[id]/payment-plan-record-layout";
import { projectRecordLayout } from "@/app/(authenticated)/record/(real-estate)/projects/r/[id]/project-record-layout";
import { propertyRecordLayout } from "@/app/(authenticated)/record/(real-estate)/properties/r/[id]/property-record-layout";
import { useRecordLayout } from "@/hooks/use-record-layout";

import type { RecordPageLayout } from "./layout";

/**
 * Entity type that maps to record layouts
 */
export type EntityType =
  | "org_contacts"
  | "org_leads"
  | "org_accounts"
  | "org_opportunities"
  | "org_activities"
  | "org_categories"
  | "org_tags"
  | "org_events"
  | "org_tasks"
  | "org_email_templates"
  | "org_email_campaigns"
  | "org_email_domains"
  | "org_real_estate_projects"
  | "org_real_estate_properties"
  | "org_real_estate_bookings"
  | "org_payment_plans"
  | "org_payment_plan_templates"
  | "org_email_test_receivers"
  | "org_emails"
  | "org_email_clicks"
  | "org_real_estate_booking_buyers";

/**
 * Default TypeScript layouts for each entity type
 * These serve as fallbacks when no custom layout exists in the database
 */
const DEFAULT_LAYOUTS: Partial<
  Record<EntityType, RecordPageLayout<FieldValues>>
> = {
  org_contacts: contactRecordLayout,
  org_leads: leadRecordLayout,
  org_accounts: accountRecordLayout,
  org_opportunities: opportunityRecordLayout,
  org_activities: activityRecordLayout,
  org_categories: categoriesRecordLayout,
  org_tags: tagsRecordLayout,
  org_events: eventsRecordLayout,
  org_tasks: tasksRecordLayout,
  org_email_templates: emailTemplateRecordLayout,
  org_email_campaigns: emailCampaignRecordLayout,
  org_email_test_receivers: emailTestReceiverRecordLayout,
  org_email_domains: emailDomainsRecordLayout,
  org_emails: emailsRecordLayout,
  org_email_clicks: emailClicksRecordLayout,
  org_real_estate_projects: projectRecordLayout,
  org_real_estate_properties: propertyRecordLayout,
  org_real_estate_bookings: bookingRecordLayout,
  org_payment_plans: paymentPlanRecordLayout,
  org_payment_plan_templates: paymentPlanTemplateRecordLayout,
  org_real_estate_booking_buyers: bookingBuyersRecordLayout,
};

/**
 * Hook that provides the record layout for a given entity type
 * Falls back to TypeScript default layouts if no custom layout exists
 */
export function useLayout(
  entityType: EntityType,
): RecordPageLayout<FieldValues> {
  const { data: customLayout } = useRecordLayout(entityType);

  return useMemo(() => {
    // If no custom layout exists or it's marked as default, use TypeScript default
    if (!customLayout || customLayout.isDefault) {
      const defaultLayout = DEFAULT_LAYOUTS[entityType];
      if (defaultLayout) {
        return defaultLayout as RecordPageLayout<FieldValues>;
      }
      // Return a minimal fallback layout for unknown entity types
      return {
        header: {
          title: { fieldId: "name", fallback: "Untitled record" },
          metadata: [
            {
              fieldId: "createdAt",
              id: "created-at",
              label: "Created",
              type: "datetime",
            },
            {
              fieldId: "updatedAt",
              id: "updated-at",
              label: "Updated",
              type: "datetime",
            },
          ],
        },
        sectionColumns: {
          header: {
            sections: [
              {
                id: "overview",
                title: "Overview",
                fields: [{ id: "name", label: "Name", type: "text" }],
              },
            ],
          },
        },
        supplementalFields: [],
      } as RecordPageLayout<FieldValues>;
    }

    // Merge custom layout with base default for type safety
    const baseLayout = DEFAULT_LAYOUTS[entityType];
    if (baseLayout) {
      // Deep merge to preserve type safety while using custom layout
      return {
        ...baseLayout,
        ...customLayout,
        header: { ...baseLayout.header, ...(customLayout.header || {}) },
        sectionColumns: {
          ...baseLayout.sectionColumns,
          ...(customLayout.sectionColumns || {}),
        },
      } as RecordPageLayout<FieldValues>;
    }

    // Return custom layout as-is for entities without TypeScript defaults
    return customLayout as RecordPageLayout<FieldValues>;
  }, [customLayout, entityType]);
}
