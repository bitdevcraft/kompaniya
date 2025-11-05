"use client";

import { usePathname } from "next/navigation";

import { TabList } from "@/components/tabs-link";

export function NavigationTabs() {
  const pathname = usePathname();

  const links = [
    {
      to: "/settings/security/password",
      text: "Password",
      active: pathname === "/settings/security/password",
    },
    {
      to: "/settings/security/account",
      text: "Account",
      active: pathname === "/settings/security/account",
    },
  ];

  return <TabList links={links} />;
}
