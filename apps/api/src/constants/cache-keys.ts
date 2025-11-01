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
};
