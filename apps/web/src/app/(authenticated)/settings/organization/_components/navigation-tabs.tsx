"use client";

import { usePathname } from "next/navigation";

import { TabList } from "@/components/tabs-link";

export function NavigationTabs() {
  const pathname = usePathname();

  const links = [
    {
      to: "/settings/organization/users",
      text: "Users",
      active: pathname === "/settings/organization/users",
    },
    {
      to: "/settings/organization/teams",
      text: "Teams",
      active: pathname === "/settings/organization/teams",
    },
    {
      to: "/settings/organization/permissions",
      text: "Permissions",
      active: pathname === "/settings/organization/permissions",
    },
    {
      to: "/settings/organization/billing",
      text: "Billing",
      active: pathname === "/settings/organization/billing",
    },
  ];

  return <TabList links={links} />;
}
