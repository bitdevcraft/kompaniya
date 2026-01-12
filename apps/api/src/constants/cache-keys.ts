export const Keys = {
  Session: {
    token(token: string) {
      return `session:token:${token}`;
    },
  },
  Member: {
    organization(userId: string) {
      return `member:organization:${userId}`;
    },
    membership(userId: string, organizationId: string) {
      return `member:membership:${userId}-${organizationId}`;
    },
  },
  User: {
    id(userId: string) {
      return `user:id:${userId}`;
    },
  },
  SuperAdminOrganization: {
    paginated(userId: string) {
      return `super-admin:organization:paginated:${userId}`;
    },
    paginatedList(userId: string) {
      return `super-admin:organization:paginated-list:${userId}`;
    },
    id(id: string) {
      return `super-admin:organization:id:${id}`;
    },
  },
  Domain: {
    paginated(userId: string, organizationId: string) {
      return `domain:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `domain:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `domain:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `domain:id:${id}-${organizationId}`;
    },
    name(name: string) {
      return `domain:name:${name}`;
    },
    emailAttributes(email: string) {
      return `domain:email-attributes:${email}`;
    },
    secretKey(secretKey: string) {
      return `domain:secret:${secretKey}`;
    },
    publicKey(publicKey: string) {
      return `domain:public:${publicKey}`;
    },
  },
  Account: {
    paginated(userId: string, organizationId: string) {
      return `account:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `account:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `account:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `account:id:${id}-${organizationId}`;
    },
  },
  Activity: {
    paginated(userId: string, organizationId: string) {
      return `activity:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `activity:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `activity:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `activity:id:${id}-${organizationId}`;
    },
  },
  Category: {
    paginated(userId: string, organizationId: string) {
      return `category:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `category:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `category:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `category:id:${id}-${organizationId}`;
    },
  },
  Contact: {
    paginated(userId: string, organizationId: string) {
      return `contact:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `contact:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `contact:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `contact:id:${id}-${organizationId}`;
    },
  },
  EmailCampaign: {
    paginated(userId: string, organizationId: string) {
      return `email-campaign:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `email-campaign:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `email-campaign:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `email-campaign:id:${id}-${organizationId}`;
    },
  },
  EmailTemplate: {
    paginated(userId: string, organizationId: string) {
      return `email-template:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `email-template:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `email-template:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `email-template:id:${id}-${organizationId}`;
    },
  },
  EmailTestReceiver: {
    paginated(userId: string, organizationId: string) {
      return `email-test-receiver:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `email-test-receiver:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `email-test-receiver:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `email-test-receiver:id:${id}-${organizationId}`;
    },
  },
  Lead: {
    paginated(userId: string, organizationId: string) {
      return `lead:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `lead:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `lead:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `lead:id:${id}-${organizationId}`;
    },
  },
  Opportunity: {
    paginated(userId: string, organizationId: string) {
      return `opportunity:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `opportunity:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `opportunity:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `opportunity:id:${id}-${organizationId}`;
    },
  },
  RealEstateProject: {
    paginated(userId: string, organizationId: string) {
      return `real-estate-project:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `real-estate-project:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `real-estate-project:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `real-estate-project:id:${id}-${organizationId}`;
    },
  },
  RealEstateProperty: {
    paginated(userId: string, organizationId: string) {
      return `real-estate-property:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `real-estate-property:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `real-estate-property:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `real-estate-property:id:${id}-${organizationId}`;
    },
  },
  RealEstateBooking: {
    paginated(userId: string, organizationId: string) {
      return `real-estate-booking:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `real-estate-booking:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `real-estate-booking:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `real-estate-booking:id:${id}-${organizationId}`;
    },
  },
  RealEstatePaymentPlan: {
    paginated(userId: string, organizationId: string) {
      return `real-estate-payment-plan:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `real-estate-payment-plan:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `real-estate-payment-plan:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `real-estate-payment-plan:id:${id}-${organizationId}`;
    },
  },
  PaymentPlan: {
    paginated(userId: string, organizationId: string) {
      return `payment-plan:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `payment-plan:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `payment-plan:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `payment-plan:id:${id}-${organizationId}`;
    },
  },
  PaymentPlanTemplate: {
    paginated(userId: string, organizationId: string) {
      return `payment-plan-template:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `payment-plan-template:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `payment-plan-template:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `payment-plan-template:id:${id}-${organizationId}`;
    },
  },
  Tag: {
    paginated(userId: string, organizationId: string) {
      return `tag:paginated:${userId}:${organizationId}`;
    },
    paginatedList(userId: string, organizationId: string) {
      return `tag:paginated-list:${userId}:${organizationId}`;
    },
    id(id: string) {
      return `tag:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `tag:id:${id}-${organizationId}`;
    },
  },
  CustomField: {
    definitionsByEntity(organizationId: string, entityType: string) {
      return `custom-field:definitions:${organizationId}:${entityType}`;
    },
    id(id: string) {
      return `custom-field:id:${id}`;
    },
    idByOrg(id: string, organizationId: string) {
      return `custom-field:id:${id}-${organizationId}`;
    },
  },
  RecordLayout: {
    layout(organizationId: string, entityType: string) {
      return `record-layout:layout:${organizationId}:${entityType}`;
    },
  },
  Setup: {
    existing() {
      return `setup-existing`;
    },
  },
  OrganizationRole: {
    byOrg(id: string) {
      return `organization-role:id:${id}`;
    },
  },
};
