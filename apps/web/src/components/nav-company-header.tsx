"use client";

import { SidebarMenuButton } from "@kompaniya/ui-common/components/sidebar";
import { Skeleton } from "@kompaniya/ui-common/components/skeleton";
import { GalleryVerticalEnd } from "lucide-react";

import { authClient } from "@/lib/auth/client";

export function NavCompanyHeader() {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  return (
    <SidebarMenuButton size={"lg"}>
      <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
        <GalleryVerticalEnd className="size-4" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">
          {activeOrganization?.name ?? (
            <>
              <Skeleton className="h-4 w-full" />
            </>
          )}
        </span>
        <span className="truncate text-xs">Plan</span>
      </div>
    </SidebarMenuButton>
  );
}
