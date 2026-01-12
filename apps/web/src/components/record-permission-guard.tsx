"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";
import { RESOURCE_PERMISSION_MAP } from "@/lib/record-permissions";

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

  const resource = Object.keys(RESOURCE_PERMISSION_MAP).find((path) =>
    pathname.startsWith(path),
  );
  const permissionResource = resource
    ? RESOURCE_PERMISSION_MAP[resource]
    : undefined;
  const hasViewPermission =
    permissionResource &&
    Array.isArray(permissions?.[permissionResource]) &&
    permissions[permissionResource].includes("view");

  useEffect(() => {
    if (!organizationId) return;
    if (isLoading) return;
    if (!permissionResource) return;

    if (isError || !permissions) {
      router.replace("/unauthorized");
      return;
    }

    if (!hasViewPermission) {
      router.replace("/unauthorized");
    }
  }, [
    organizationId,
    isLoading,
    permissionResource,
    isError,
    permissions,
    hasViewPermission,
    router,
  ]);

  if (!organizationId) return null;
  if (!permissionResource) return children;
  if (isLoading || isError || !permissions) return null;
  if (!hasViewPermission) return null;

  return children;
}
