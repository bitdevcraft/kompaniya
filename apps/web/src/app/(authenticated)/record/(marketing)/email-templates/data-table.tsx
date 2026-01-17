"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import { Plus } from "lucide-react";
import Link from "next/link";

import { RecordEntityDataTable } from "@/components/record-entity";
import { SearchParamsSchema } from "@/types/validations";

import { ImportButton } from "./new/import-button";
import { useEmailTemplatesEntityConfig } from "./use-email-templates-entity-config";

interface OrgDataTableProps {
  search: SearchParamsSchema;
}

const newButton = (
  <Button asChild size="sm" variant="outline">
    <Link href="/record/email-templates/new">
      <Plus />
      New
    </Link>
  </Button>
);

export function OrgDataTable({ search }: OrgDataTableProps) {
  const config = useEmailTemplatesEntityConfig();

  return (
    <RecordEntityDataTable
      config={config}
      importButton={<ImportButton />}
      newButton={newButton}
      search={search}
    />
  );
}
