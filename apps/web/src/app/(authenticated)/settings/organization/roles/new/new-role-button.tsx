"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewRoleButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/settings/organization/roles/new")}
      size="sm"
      variant="outline"
    >
      <Plus />
      New Role
    </Button>
  );
}
