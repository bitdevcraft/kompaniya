"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function NewButton() {
  return (
    <Button asChild size={"sm"} variant={"outline"}>
      <Link href="/marketing/email-campaigns/new">
        <Plus />
        New
      </Link>
    </Button>
  );
}
