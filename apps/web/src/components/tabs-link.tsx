"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";
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
    <Tabs defaultValue={pathname}>
      <TabsList className="gap-4 w-full justify-start">
        {links.map((link) => (
          <TabsTrigger
            asChild
            className="max-w-32"
            key={link.to}
            value={link.to}
          >
            <Link href={link.to}>{link.text}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
