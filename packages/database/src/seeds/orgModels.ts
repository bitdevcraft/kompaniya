import { eq } from "drizzle-orm";

import { db, Db } from "@/db";
import { DEFAULT_RECORD_LAYOUTS } from "@/defaults/record-layouts";
import {
  LayoutSectionItem,
  NewOrgOpportunity,
  orgAccountsTable,
  orgActivitiesTable,
  orgCategoriesTable,
  orgContactsTable,
  orgEventsTable,
  orgLeadsTable,
  orgOpportunitiesTable,
  orgRealEstateBookingsTable,
  orgRealEstateProjectsTable,
  orgRealEstatePropertiesTable,
  orgRecordLayoutsTable,
  orgTagsTable,
  orgTasksTable,
  RecordLayoutEntityType,
  RecordLayoutHeader,
  RecordLayoutSectionColumns,
  usersTable,
} from "@/schema";

export interface SeedOrgModelsOptions {
  organizationId: string;
  userId?: string;
}

const buildOwnershipFields = (organizationId: string, userId?: string) => ({
  organizationId,
  ...(userId
    ? {
        ownerId: userId,
        createdBy: userId,
        lastUpdatedBy: userId,
      }
    : {}),
});

const TAGS_BY_TYPE: Record<string, string[]> = {
  account: ["priority", "b2b", "pilot"],
  activity: ["demo", "follow-up", "urgent"],
  category: ["sales", "marketing", "product"],
  contact: ["champion", "economic-buyer", "user"],
  domain: ["verified", "pending", "primary"],
  "email-campaign": ["newsletter", "promo", "transactional"],
  "email-template": ["welcome", "update", "feedback"],
  "email-test-receiver": ["internal", "qa", "leadership"],
  lead: ["webinar", "event", "referral"],
  opportunity: ["rollout", "expansion", "renewal"],
  "payment-plan": ["monthly", "quarterly", "annual"],
  "payment-plan-template": ["starter", "professional", "enterprise"],
  "real-estate-booking": ["confirmed", "pending", "cancelled"],
  "real-estate-project": ["commercial", "residential", "mixed-use"],
  "real-estate-property": ["available", "reserved", "sold"],
};

export async function seedOrgModels(
  dbInstance: Db,
  { organizationId, userId }: SeedOrgModelsOptions,
) {
  if (!organizationId) {
    throw new Error("organizationId is required to seed org models");
  }

  const ownershipFields = buildOwnershipFields(organizationId, userId);

  // Query user email to get domain for contact emails
  let ownerEmailDomain = "example.org";
  if (userId) {
    const user = await dbInstance
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (user[0]?.email) {
      const emailMatch = /@(.+)$/.exec(user[0].email);
      if (emailMatch?.[1]) {
        ownerEmailDomain = emailMatch[1];
      }
    }
  }

  return dbInstance.transaction(async (tx) => {
    // Seed tags for all entity types
    const tagValues = Object.entries(TAGS_BY_TYPE).flatMap(
      ([relatedType, names]) =>
        names.map((name) => ({
          ...ownershipFields,
          name,
          relatedType,
        })),
    );
    const tags = await tx.insert(orgTagsTable).values(tagValues).returning();

    const categories = await tx
      .insert(orgCategoriesTable)
      .values([
        { ...ownershipFields, name: "Sales" },
        { ...ownershipFields, name: "Marketing" },
        { ...ownershipFields, name: "Product" },
      ])
      .returning();

    const activities = await tx
      .insert(orgActivitiesTable)
      .values([
        { ...ownershipFields, name: "Demo Scheduled" },
        { ...ownershipFields, name: "Contract Sent" },
        { ...ownershipFields, name: "Kicked Off" },
      ])
      .returning();

    const accountTags = TAGS_BY_TYPE.account ?? [];
    const accounts = await tx
      .insert(orgAccountsTable)
      .values([
        {
          ...ownershipFields,
          name: "Acme Corporation",
          email: "hello@acme.test",
          tags: [accountTags[0] ?? "priority", accountTags[1] ?? "b2b"],
          categories: [categories[0]?.name ?? "Sales"],
        },
        {
          ...ownershipFields,
          name: "Globex Labs",
          email: "contact@globex.test",
          tags: [accountTags[2] ?? "pilot"],
          categories: [categories[1]?.name ?? "Marketing"],
        },
        {
          ...ownershipFields,
          name: "Initech",
          email: "team@initech.test",
          tags: [accountTags[2] ?? "pilot"],
          categories: [categories[2]?.name ?? "Product"],
        },
      ])
      .returning();

    const contactTags = TAGS_BY_TYPE.contact ?? [];
    const contacts = await tx
      .insert(orgContactsTable)
      .values([
        {
          ...ownershipFields,
          firstName: "Alice",
          lastName: "Nguyen",
          email: `alice.nguyen@${ownerEmailDomain}`,
          phone: "+1-555-0100",
          tags: [contactTags[0] ?? "champion"],
        },
        {
          ...ownershipFields,
          firstName: "Brian",
          lastName: "Ibrahim",
          email: `brian@${ownerEmailDomain}`,
          phone: "+1-555-0110",
          tags: [contactTags[1] ?? "economic-buyer"],
        },
        {
          ...ownershipFields,
          firstName: "Chloe",
          lastName: "Martinez",
          email: `chloe.martinez@${ownerEmailDomain}`,
          phone: "+1-555-0120",
          tags: [contactTags[2] ?? "user"],
        },
      ])
      .returning();

    const leadTags = TAGS_BY_TYPE.lead ?? [];
    const leads = await tx
      .insert(orgLeadsTable)
      .values([
        {
          ...ownershipFields,
          firstName: "Dan",
          lastName: "Riley",
          email: "dan.riley@prospect.test",
          tags: [leadTags[0] ?? "webinar"],
        },
        {
          ...ownershipFields,
          firstName: "Ella",
          lastName: "Ford",
          email: "ella.ford@prospect.test",
          tags: [leadTags[1] ?? "event"],
        },
        {
          ...ownershipFields,
          firstName: "Farid",
          lastName: "Zaman",
          email: "farid.zaman@prospect.test",
          tags: [leadTags[2] ?? "referral"],
        },
      ])
      .returning();

    const events = await tx
      .insert(orgEventsTable)
      .values([
        {
          ...ownershipFields,
          name: "Signup Completed",
          relatedId: leads[0]?.id,
          relatedType: "lead",
          payload: { plan: "pro" },
          metadata: { source: "web" },
        },
        {
          ...ownershipFields,
          name: "Demo Requested",
          relatedId: contacts[0]?.id,
          relatedType: "contact",
          payload: { timeframe: "Q1" },
          metadata: { channel: "email" },
        },
        {
          ...ownershipFields,
          name: "Churn Risk",
          relatedId: accounts[2]?.id,
          relatedType: "account",
          payload: { signals: ["low-usage"] },
          metadata: { healthScore: 52 },
        },
      ])
      .returning();

    const opportunityTags = TAGS_BY_TYPE.opportunity ?? [];
    const newOpportunities: NewOrgOpportunity[] = [
      {
        ...ownershipFields,
        name: "Workspace roll-out",
        description: "Initial deployment across the sales org",
        accountId: accounts[0]?.id,
        amount: "125000",
        currencyCode: "USD",
        nextStep: "Finalize security review",
        priority: "high",
        tags: [opportunityTags[0] ?? "rollout"],
      },
      {
        ...ownershipFields,
        name: "Expansion for support",
        description: "Add-on for support workflows",
        accountId: accounts[1]?.id,
        amount: "48000",
        currencyCode: "USD",
        nextStep: "Send proposal",
        priority: "medium",
        tags: [opportunityTags[1] ?? "expansion"],
      },
      {
        ...ownershipFields,
        name: "Renewal - Initech",
        description: "Annual renewal with usage uplift",
        accountId: accounts[2]?.id,
        amount: "76000",
        currencyCode: "USD",
        nextStep: "Align on pricing",
        priority: "urgent",
        tags: [opportunityTags[2] ?? "renewal"],
      },
    ];

    const opportunities = await tx
      .insert(orgOpportunitiesTable)
      .values(newOpportunities)
      .returning();

    const tasks = await tx
      .insert(orgTasksTable)
      .values([
        {
          ...ownershipFields,
          relatedId: opportunities[0]?.id,
          relatedType: "opportunity",
          metadata: { action: "schedule_security_call" },
        },
        {
          ...ownershipFields,
          relatedId: opportunities[1]?.id,
          relatedType: "opportunity",
          metadata: { action: "draft_proposal" },
        },
        {
          ...ownershipFields,
          relatedId: opportunities[2]?.id,
          relatedType: "opportunity",
          metadata: { action: "renewal_checkin" },
        },
      ])
      .returning();

    const realEstateProjects = await tx
      .insert(orgRealEstateProjectsTable)
      .values([
        { ...ownershipFields, name: "Downtown Residences" },
        { ...ownershipFields, name: "Harbor View" },
        { ...ownershipFields, name: "Canyon Villas" },
      ])
      .returning();

    const realEstateProperties = await tx
      .insert(orgRealEstatePropertiesTable)
      .values([
        { ...ownershipFields, name: "Unit 101" },
        { ...ownershipFields, name: "Suite 220" },
        { ...ownershipFields, name: "Penthouse 9" },
      ])
      .returning();

    const realEstateBookings = await tx
      .insert(orgRealEstateBookingsTable)
      .values([
        { ...ownershipFields, name: "Booking Alpha" },
        { ...ownershipFields, name: "Booking Bravo" },
        { ...ownershipFields, name: "Booking Charlie" },
      ])
      .returning();

    // Seed default record layouts for all entity types
    const recordLayouts = await tx
      .insert(orgRecordLayoutsTable)
      .values(
        Object.entries(DEFAULT_RECORD_LAYOUTS).map(([entityType, layout]) => ({
          organizationId,
          entityType: entityType as RecordLayoutEntityType,
          header: layout.header as RecordLayoutHeader,
          sectionColumns: layout.sectionColumns as RecordLayoutSectionColumns,
          sections: ("sections" in layout ? layout.sections : undefined) as
            | LayoutSectionItem[]
            | undefined,
          supplementalFields: ("supplementalFields" in layout
            ? layout.supplementalFields
            : []) as unknown[],
          autoIncludeCustomFields: true,
          isCustomized: false,
          isDeleted: false,
          createdBy: userId,
          updatedBy: userId,
        })),
      )
      .returning();

    return {
      tags,
      activities,
      accounts,
      categories,
      contacts,
      leads,
      events,
      opportunities,
      tasks,
      realEstateProjects,
      realEstateProperties,
      realEstateBookings,
      recordLayouts,
    };
  });
}

function getArgValue(flag: string, argv: string[]) {
  const index = argv.indexOf(flag);
  return index >= 0 ? argv[index + 1] : undefined;
}

async function runCli() {
  const argv = process.argv.slice(2);
  const organizationId =
    getArgValue("--organization-id", argv) ??
    getArgValue("--organizationId", argv) ??
    process.env.ORGANIZATION_ID;
  const userId =
    getArgValue("--user-id", argv) ?? getArgValue("--userId", argv);

  if (!organizationId) {
    console.error("Please provide --organization-id or set ORGANIZATION_ID.");
    process.exit(1);
  }

  try {
    const result = await seedOrgModels(db, { organizationId, userId });

    console.log(
      `Seeded org models for organization ${organizationId}.`,
      Object.fromEntries(
        Object.entries(result).map(([key, value]) => [key, value.length]),
      ),
    );
  } catch (error) {
    console.error("Seeding org models failed:", error);
    process.exit(1);
  }
}

if (
  typeof require !== "undefined" &&
  typeof module !== "undefined" &&
  require.main === module
) {
  void runCli();
}
