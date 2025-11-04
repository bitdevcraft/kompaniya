export type RoleOrRoles =
  | 'member'
  | 'admin'
  | 'owner'
  | ('member' | 'admin' | 'owner')[];

export class CreateUserDto {
  data?: Record<string, any>;
  email!: string;
  name!: string;
  password!: string;
  role!: RoleOrRoles;
}
