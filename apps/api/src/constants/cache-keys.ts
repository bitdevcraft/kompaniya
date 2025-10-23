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
  },
};
