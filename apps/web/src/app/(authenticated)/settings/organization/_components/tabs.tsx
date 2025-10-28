"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@repo/shared-ui/components/common/tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface TabProps {
  links: {
    to: string;
    text: string;
    active: boolean;
  }[];
}

export function TabList({ links }: TabProps) {
  const pathname = usePathname();

  return (
    <Tabs value={pathname}>
      <TabsList className="gap-4 w-full">
        {links.map((link) => (
          <TabsTrigger asChild key={link.to} value={link.to}>
            <Link href={link.to}>{link.text}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
