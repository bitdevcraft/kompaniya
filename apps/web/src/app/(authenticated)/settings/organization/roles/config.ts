import type { Crud } from "@repo/shared/auth";

export type PermissionAction = Crud | "access";

export const PROTECTED_ROLES = [
  "admin",
  "owner",
  "member",
] as readonly string[];

export const MODEL = {
  singular: "role",
  plural: "roles",
};

export type PermissionState = Record<string, PermissionAction[]>;

export type RoleRow = {
  id: string;
  role: string;
  permission: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};
