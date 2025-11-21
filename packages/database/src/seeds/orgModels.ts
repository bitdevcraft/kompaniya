import { randomUUID } from "crypto";

import { db, Db } from "@/db";
import {
  NewOrgOpportunity,
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
  orgRealEstateBookingsTable,
  orgRealEstatePaymentPlansTable,
  orgRealEstateProjectsTable,
  orgRealEstatePropertiesTable,
  orgTasksTable,
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

export async function seedOrgModels(
  dbInstance: Db,
  { organizationId, userId }: SeedOrgModelsOptions,
) {
  if (!organizationId) {
    throw new Error("organizationId is required to seed org models");
  }

  const ownershipFields = buildOwnershipFields(organizationId, userId);

  return dbInstance.transaction(async (tx) => {
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

    const accounts = await tx
      .insert(orgAccountsTable)
      .values([
        {
          ...ownershipFields,
          name: "Acme Corporation",
          email: "hello@acme.test",
          tags: ["priority", "b2b"],
          categories: [categories[0]?.name ?? "Sales"],
        },
        {
          ...ownershipFields,
          name: "Globex Labs",
          email: "contact@globex.test",
          tags: ["pilot"],
          categories: [categories[1]?.name ?? "Marketing"],
        },
        {
          ...ownershipFields,
          name: "Initech",
          email: "team@initech.test",
          tags: ["renewal"],
          categories: [categories[2]?.name ?? "Product"],
        },
      ])
      .returning();

    const contacts = await tx
      .insert(orgContactsTable)
      .values([
        {
          ...ownershipFields,
          firstName: "Alice",
          lastName: "Nguyen",
          email: "alice.nguyen@acme.test",
          phone: "+1-555-0100",
          tags: ["champion"],
        },
        {
          ...ownershipFields,
          firstName: "Brian",
          lastName: "Ibrahim",
          email: "brian@globex.test",
          phone: "+1-555-0110",
          tags: ["economic-buyer"],
        },
        {
          ...ownershipFields,
          firstName: "Chloe",
          lastName: "Martinez",
          email: "chloe.martinez@initech.test",
          phone: "+1-555-0120",
          tags: ["user"],
        },
      ])
      .returning();

    const leads = await tx
      .insert(orgLeadsTable)
      .values([
        {
          ...ownershipFields,
          firstName: "Dan",
          lastName: "Riley",
          email: "dan.riley@prospect.test",
          tags: ["webinar"],
        },
        {
          ...ownershipFields,
          firstName: "Ella",
          lastName: "Ford",
          email: "ella.ford@prospect.test",
          tags: ["event"],
        },
        {
          ...ownershipFields,
          firstName: "Farid",
          lastName: "Zaman",
          email: "farid.zaman@prospect.test",
          tags: ["referral"],
        },
      ])
      .returning();

    const emailDomains = await tx
      .insert(orgEmailDomainsTable)
      .values([
        {
          ...ownershipFields,
          name: "campaigns.acme.test",
          email: "news@acme.test",
          public: randomUUID(),
          secret: randomUUID(),
          status: "READY",
        },
        {
          ...ownershipFields,
          name: "updates.globex.test",
          email: "hello@globex.test",
          public: randomUUID(),
          secret: randomUUID(),
          status: "PENDING",
        },
        {
          ...ownershipFields,
          name: "growth.initech.test",
          email: "growth@initech.test",
          public: randomUUID(),
          secret: randomUUID(),
          status: "READY",
        },
      ])
      .returning();

    const emailTemplates = await tx
      .insert(orgEmailTemplatesTable)
      .values([
        {
          ...ownershipFields,
          name: "Welcome Series",
          subject: "Welcome to our platform",
          body: "Hi {{firstName}}, thanks for joining us!",
        },
        {
          ...ownershipFields,
          name: "Product Update",
          subject: "What's new this month",
          body: "We shipped great features you will love.",
        },
        {
          ...ownershipFields,
          name: "Feedback Request",
          subject: "Can we get your feedback?",
          body: "Tell us how we did and what to improve.",
        },
      ])
      .returning();

    const emailTestReceivers = await tx
      .insert(orgEmailTestReceiversTable)
      .values([
        {
          ...ownershipFields,
          name: "Growth Team",
          emails: ["growth@acme.test"],
        },
        { ...ownershipFields, name: "QA Review", emails: ["qa@globex.test"] },
        {
          ...ownershipFields,
          name: "Leadership",
          emails: ["leaders@initech.test"],
        },
      ])
      .returning();

    const emailCampaigns = await tx
      .insert(orgEmailCampaignsTable)
      .values([
        {
          ...ownershipFields,
          name: "Onboarding Drip",
          subject: "Get started with your workspace",
          body: "Let's take you through the basics.",
          orgEmailDomainId: emailDomains[0]?.id,
          orgEmailTemplateId: emailTemplates[0]?.id,
          orgEmailTestReceiverId: emailTestReceivers[0]?.id,
          targetCategories: [categories[0]?.name ?? "Sales"],
          status: "active",
        },
        {
          ...ownershipFields,
          name: "Quarterly Product Update",
          subject: "See what's new",
          body: "New modules and integrations are live.",
          orgEmailDomainId: emailDomains[1]?.id,
          orgEmailTemplateId: emailTemplates[1]?.id,
          orgEmailTestReceiverId: emailTestReceivers[1]?.id,
          targetCategories: [categories[1]?.name ?? "Marketing"],
          status: "draft",
        },
        {
          ...ownershipFields,
          name: "NPS Survey",
          subject: "How are we doing?",
          body: "Share feedback to shape our roadmap.",
          orgEmailDomainId: emailDomains[2]?.id,
          orgEmailTemplateId: emailTemplates[2]?.id,
          orgEmailTestReceiverId: emailTestReceivers[2]?.id,
          targetCategories: [categories[2]?.name ?? "Product"],
          status: "scheduled",
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

    const emails = await tx
      .insert(orgEmailsTable)
      .values([
        {
          ...ownershipFields,
          messageId: `msg-${randomUUID()}`,
          subject: "Welcome Aboard",
          status: "SENT",
          emailCampaignId: emailCampaigns[0]?.id,
          emailDomainId: emailDomains[0]?.id,
          crmContactId: contacts[0]?.id,
        },
        {
          ...ownershipFields,
          messageId: `msg-${randomUUID()}`,
          subject: "Feature Highlights",
          status: "DELIVERED",
          emailCampaignId: emailCampaigns[1]?.id,
          emailDomainId: emailDomains[1]?.id,
          crmContactId: contacts[1]?.id,
        },
        {
          ...ownershipFields,
          messageId: `msg-${randomUUID()}`,
          subject: "Share Your Feedback",
          status: "OPENED",
          emailCampaignId: emailCampaigns[2]?.id,
          emailDomainId: emailDomains[2]?.id,
          crmContactId: contacts[2]?.id,
        },
      ])
      .returning();

    const emailClicks = await tx
      .insert(orgEmailClicksTable)
      .values([
        {
          ...ownershipFields,
          link: "https://example.test/getting-started",
          orgEmailId: emails[0]?.id,
          orgEmailDomainId: emailDomains[0]?.id,
        },
        {
          ...ownershipFields,
          link: "https://example.test/product-tour",
          orgEmailId: emails[1]?.id,
          orgEmailDomainId: emailDomains[1]?.id,
        },
        {
          ...ownershipFields,
          link: "https://example.test/nps",
          orgEmailId: emails[2]?.id,
          orgEmailDomainId: emailDomains[2]?.id,
        },
      ])
      .returning();

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
        tags: ["rollout"],
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
        tags: ["expansion"],
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
        tags: ["renewal"],
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

    const realEstatePaymentPlans = await tx
      .insert(orgRealEstatePaymentPlansTable)
      .values([
        { ...ownershipFields, name: "Standard 12" },
        { ...ownershipFields, name: "Accelerated 6" },
        { ...ownershipFields, name: "Extended 24" },
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

    return {
      activities,
      accounts,
      categories,
      contacts,
      leads,
      emailDomains,
      emailTemplates,
      emailTestReceivers,
      emailCampaigns,
      events,
      emails,
      emailClicks,
      opportunities,
      tasks,
      realEstateProjects,
      realEstateProperties,
      realEstatePaymentPlans,
      realEstateBookings,
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
