"use client";

import { usePathname } from "next/navigation";

import { TabList } from "@/components/tabs-link";

export function NavigationTabs() {
  const pathname = usePathname();

  const links = [
    {
      to: "/settings/email-setup/domains",
      text: "Domains",
      active: pathname === "/settings/email-setup/domains",
    },
  ];

  return <TabList links={links} />;
}
