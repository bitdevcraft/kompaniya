"use client";

import { authClient } from "@/lib/auth/client";

import type { PermissionState, RoleRow } from "./config";

export async function createRole(payload: {
  role: string;
  permission: PermissionState;
  organizationId: string;
}) {
  const result = await authClient.$fetch("/organization/create-role", {
    method: "POST",
    body: {
      role: payload.role,
      permission: payload.permission,
      organizationId: payload.organizationId,
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function deleteRole(payload: {
  role: string;
  organizationId: string;
}) {
  const result = await authClient.$fetch("/organization/delete-role", {
    method: "POST",
    body: {
      roleName: payload.role,
      organizationId: payload.organizationId,
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function fetchRoles(
  organizationId: string,
  _page: number,
  _pageSize: number,
): Promise<RoleRow[] | null> {
  const { data } = await authClient.organization.listRoles({
    query: {
      organizationId,
    },
  });

  return data as RoleRow[] | null;
}

export async function updateRole(payload: {
  role: string;
  permission: PermissionState;
  organizationId: string;
}) {
  const result = await authClient.$fetch("/organization/update-role", {
    method: "POST",
    body: {
      roleName: payload.role,
      data: {
        permission: payload.permission,
      },
      organizationId: payload.organizationId,
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

// Custom hook for delete mutation (to match the pattern used in the table)
export function useDeleteRole() {
  return {
    mutateAsync: deleteRole,
    isPending: false,
  };
}
