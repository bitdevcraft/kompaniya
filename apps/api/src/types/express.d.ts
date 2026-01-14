import { Organization } from '@repo/database/schema';

declare global {
  namespace Express {
    interface Request {
      activeOrganization?: Organization;
      rawBody?: Buffer;
    }
  }
}
