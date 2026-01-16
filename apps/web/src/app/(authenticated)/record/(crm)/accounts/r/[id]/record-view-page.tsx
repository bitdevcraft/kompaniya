"use client";

import type { OrgAccount } from "@repo/database/schema";

import type { RecordPageLayout } from "@/components/record-page/layout";

import { RecordEntityViewPage } from "@/components/record-entity";
import { useLayout } from "@/components/record-page/use-layout";

import type { AccountRecordSubmitValues } from "../../account-record-schema";

import {
  accountRecordSchema,
  createAccountFormDefaults,
  createAccountUpdatePayload,
} from "../../account-record-schema";
import { useAccountsEntityConfig } from "../../use-accounts-entity-config";

interface RecordViewPageProps {
  initialRecord?: OrgAccount;
  recordId: string;
}

const accountRecordQueryKey = (recordId: string) =>
  ["account-record", recordId] as const;

const useAccountLayout = () =>
  useLayout(
    "org_accounts",
  ) as unknown as RecordPageLayout<AccountRecordSubmitValues>;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const config = useAccountsEntityConfig();

  return (
    <RecordEntityViewPage<OrgAccount, AccountRecordSubmitValues>
      config={{
        entityType: config.entityType,
        modelEndpoint: config.modelEndpoint,
        basePath: config.basePath,
        model: config.model,
        queryKey: accountRecordQueryKey,
      }}
      createFormDefaults={createAccountFormDefaults}
      createUpdatePayload={createAccountUpdatePayload}
      entityLabel={config.model.name}
      initialRecord={initialRecord}
      recordId={recordId}
      schema={accountRecordSchema}
      useLayout={useAccountLayout}
    />
  );
}
