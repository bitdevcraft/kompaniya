"use client";

import { RecordEntityDataTable } from "@/components/record-entity";
import { SearchParamsSchema } from "@/types/validations";

import { ImportButton } from "./new/import-button";
import { NewButton } from "./new/new-button";
import { useEmailCampaignsEntityConfig } from "./use-email-campaigns-entity-config";

interface OrgDataTableProps {
  search: SearchParamsSchema;
}

export function OrgDataTable({ search }: OrgDataTableProps) {
  const config = useEmailCampaignsEntityConfig();

  return (
    <RecordEntityDataTable
      config={config}
      importButton={<ImportButton />}
      newButton={<NewButton />}
      search={search}
    />
  );
}
