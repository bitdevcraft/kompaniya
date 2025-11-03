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
  Domain: {
    paginated(userId: string, organizationId: string) {
      return `domain:paginated:${userId}:${organizationId}`;
    },
  },
  Account: {
    paginated(userId: string, organizationId: string) {
      return `account:paginated:${userId}:${organizationId}`;
    },
  },
  Activity: {
    paginated(userId: string, organizationId: string) {
      return `account:paginated:${userId}:${organizationId}`;
    },
  },
  Category: {
    paginated(userId: string, organizationId: string) {
      return `account:paginated:${userId}:${organizationId}`;
    },
  },
  Contact: {
    paginated(userId: string, organizationId: string) {
      return `contact:paginated:${userId}:${organizationId}`;
    },
  },
  EmailCampaign: {
    paginated(userId: string, organizationId: string) {
      return `email-campaign:paginated:${userId}:${organizationId}`;
    },
  },
  EmailTemplate: {
    paginated(userId: string, organizationId: string) {
      return `email-template:paginated:${userId}:${organizationId}`;
    },
  },
  EmailTestReceiver: {
    paginated(userId: string, organizationId: string) {
      return `email-test-receiver:paginated:${userId}:${organizationId}`;
    },
  },
  Lead: {
    paginated(userId: string, organizationId: string) {
      return `lead:paginated:${userId}:${organizationId}`;
    },
  },
  Opportunity: {
    paginated(userId: string, organizationId: string) {
      return `opportunity:paginated:${userId}:${organizationId}`;
    },
  },
};
