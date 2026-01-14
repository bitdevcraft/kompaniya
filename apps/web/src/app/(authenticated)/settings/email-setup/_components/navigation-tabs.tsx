"use client";

import { usePathname } from "next/navigation";

import { TabList } from "@/components/tabs-link";

export function NavigationTabs() {
  const pathname = usePathname();

  const links = [
    {
      to: "/record/email-domains",
      text: "Domains",
      active: pathname === "/record/email-domains",
    },
  ];

  return <TabList links={links} />;
}
