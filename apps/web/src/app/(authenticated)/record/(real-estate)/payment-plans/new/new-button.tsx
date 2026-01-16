"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewButton() {
  const router = useRouter();

  return (
    <Button onClick={() => router.push("./new")} size="sm" variant="outline">
      <Plus />
      New
    </Button>
  );
}
