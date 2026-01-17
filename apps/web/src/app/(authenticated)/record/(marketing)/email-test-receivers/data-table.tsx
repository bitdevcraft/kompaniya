"use client";

import { RecordEntityDataTable } from "@/components/record-entity";
import { SearchParamsSchema } from "@/types/validations";

import { ImportButton } from "./new/import-button";
import { NewButton } from "./new/new-button";
import { useEmailTestReceiversEntityConfig } from "./use-email-test-receivers-entity-config";

interface OrgDataTableProps {
  search: SearchParamsSchema;
}

export function OrgDataTable({ search }: OrgDataTableProps) {
  const config = useEmailTestReceiversEntityConfig();

  return (
    <RecordEntityDataTable
      config={config}
      importButton={<ImportButton />}
      newButton={<NewButton />}
      search={search}
    />
  );
}
