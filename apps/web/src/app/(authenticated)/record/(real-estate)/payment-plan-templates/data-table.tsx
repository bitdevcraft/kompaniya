"use client";

import { RecordEntityDataTable } from "@/components/record-entity";
import { SearchParamsSchema } from "@/types/validations";

import { NewButton } from "./new/new-button";
import { usePaymentPlanTemplatesEntityConfig } from "./use-payment-plan-templates-entity-config";

interface OrgDataTableProps {
  search: SearchParamsSchema;
}

export function OrgDataTable({ search }: OrgDataTableProps) {
  const config = usePaymentPlanTemplatesEntityConfig();

  return (
    <RecordEntityDataTable
      config={config}
      newButton={<NewButton />}
      search={search}
    />
  );
}
