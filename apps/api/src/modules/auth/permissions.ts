import { createAccessControl } from 'better-auth/plugins/access';
import {
  adminAc,
  defaultStatements,
  userAc,
} from 'better-auth/plugins/admin/access';

export const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const superAdmin = ac.newRole({
  ...adminAc.statements,
});

export const systemUser = ac.newRole({
  ...userAc.statements,
});

export const systemAdmin = ac.newRole({
  user: ['create'],
});
