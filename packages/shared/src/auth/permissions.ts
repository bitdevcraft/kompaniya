import {
  type AccessControl,
  createAccessControl,
} from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements as adminDefaultStatements,
  userAc as adminUserAc,
} from "better-auth/plugins/admin/access";
import {
  adminAc as orgAdminAc,
  defaultStatements as orgDefaultStatements,
  memberAc as orgMemberAc,
  ownerAc as orgOwnerAc,
} from "better-auth/plugins/organization/access";

// Admin
export const adminStatement = {
  ...adminDefaultStatements,
} as const;

export const adminAccessControl = createAccessControl(
  adminStatement,
) as AccessControl;

export const superAdmin = adminAccessControl.newRole({
  ...adminAc.statements,
});

export const systemUser = adminAccessControl.newRole({
  ...adminUserAc.statements,
});

export const systemAdmin = adminAccessControl.newRole({
  user: ["create"],
});

// Organization Roles

export const CRUD = ["create", "update", "delete"] as const;
export type Crud = (typeof CRUD)[number];

export const ORG_RESOURCES = [
  "orgAccounts",
  "orgActivities",
  "orgCategories",
  "orgContacts",
  "orgEmailCampaigns",
  "orgEmailClicks",
  "orgEmailDomains",
  "orgEmailTemplates",
  "orgEmailTestReceivers",
  "orgEmails",
  "orgEvents",
  "orgLeads",
  "orgOpportunities",
  "orgPaymentPlanTemplates",
  "orgPaymentPlans",
  "orgRealEstateBookingBuyers",
  "orgRealEstateBookings",
  "orgRealEstateProjects",
  "orgRealEstateProperties",
  "orgRecordLayouts",
  "orgTags",
  "orgTasks",
  "orgUserTablePreferences",
] as const;

const makeStatement = <R extends readonly string[]>(
  resources: R,
  actions: readonly string[],
) =>
  Object.fromEntries(
    resources.map((r) => [r, [...actions]]),
  ) as unknown as Record<R[number], string[]>;

export const customOrgStatements = makeStatement(ORG_RESOURCES, CRUD);

export const orgStatement = {
  ...orgDefaultStatements,
  ...customOrgStatements,
} as const;

export const orgAccessControl = createAccessControl(
  orgStatement,
) as AccessControl;

export const orgAdmin = orgAccessControl.newRole({
  ...customOrgStatements,
  ...orgAdminAc.statements,
});

export const orgOwner = orgAccessControl.newRole({
  ...customOrgStatements,
  ...orgOwnerAc.statements,
});

export const orgMember = orgAccessControl.newRole({
  ...orgMemberAc.statements,
});
