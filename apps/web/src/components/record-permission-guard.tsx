"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";
import {
  RESOURCE_PERMISSION_MAP,
  SETTINGS_PERMISSION_MAP,
} from "@/lib/record-permissions";

export function RecordPermissionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: organization } = authClient.useActiveOrganization();
  const organizationId = organization?.id;
  const {
    data: permissions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["active-permissions", organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/user/active-permissions`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load permissions");
      }

      const data = (await response.json()) as { permissions?: unknown };
      return (data.permissions as Record<string, string[]>) ?? {};
    },
  });

  // Check for settings routes first (use "access" permission)
  const settingsRoute = Object.keys(SETTINGS_PERMISSION_MAP).find((path) =>
    pathname.startsWith(path),
  );
  const settingsResource = settingsRoute
    ? SETTINGS_PERMISSION_MAP[settingsRoute]
    : undefined;
  const hasAccessPermission =
    settingsResource &&
    Array.isArray(permissions?.[settingsResource]) &&
    permissions[settingsResource].includes("access");

  // Check for record routes (use "view" permission)
  const recordRoute = Object.keys(RESOURCE_PERMISSION_MAP).find((path) =>
    pathname.startsWith(path),
  );
  const recordResource = recordRoute
    ? RESOURCE_PERMISSION_MAP[recordRoute]
    : undefined;
  const hasViewPermission =
    recordResource &&
    Array.isArray(permissions?.[recordResource]) &&
    permissions[recordResource].includes("view");

  // Determine which permission type to check
  const permissionResource = settingsResource ?? recordResource;
  const requiredPermission = settingsResource ? "access" : "view";
  const hasPermission = settingsResource
    ? hasAccessPermission
    : hasViewPermission;

  useEffect(() => {
    if (!organizationId) return;
    if (isLoading) return;
    if (!permissionResource) return; // No permission required (e.g., Security, Import Data)

    if (isError || !permissions) {
      router.replace("/unauthorized");
      return;
    }

    if (!hasPermission) {
      router.replace("/unauthorized");
    }
  }, [
    organizationId,
    isLoading,
    permissionResource,
    requiredPermission,
    isError,
    permissions,
    hasPermission,
    router,
  ]);

  if (!organizationId) return null;
  if (!permissionResource) return children; // No permission required
  if (isLoading || isError || !permissions) return null;
  if (!hasPermission) return null;

  return children;
}
