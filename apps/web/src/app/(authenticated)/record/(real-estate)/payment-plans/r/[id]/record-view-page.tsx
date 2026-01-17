"use client";

import type { OrgPaymentPlan } from "@repo/database/schema";

import type { RecordPageLayout } from "@/components/record-page/layout";

import { RecordEntityViewPage } from "@/components/record-entity";
import { useLayout } from "@/components/record-page/use-layout";

import type { PaymentPlanRecordSubmitValues } from "./payment-plan-record-schema";

import { usePaymentPlansEntityConfig } from "../../use-payment-plans-entity-config";
import {
  createPaymentPlanFormDefaults,
  createPaymentPlanUpdatePayload,
  paymentPlanRecordSchema,
} from "./payment-plan-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgPaymentPlan;

  recordId: string;
}

const paymentPlanRecordQueryKey = (recordId: string) =>
  ["payment-plan-record", recordId] as const;

const usePaymentPlanLayout = () =>
  useLayout(
    "org_payment_plans",
  ) as unknown as RecordPageLayout<PaymentPlanRecordSubmitValues>;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const config = usePaymentPlansEntityConfig();

  return (
    <RecordEntityViewPage<OrgPaymentPlan, PaymentPlanRecordSubmitValues>
      config={{
        entityType: config.entityType,
        modelEndpoint: config.modelEndpoint,
        basePath: config.basePath,
        model: config.model,
        queryKey: paymentPlanRecordQueryKey,
      }}
      createFormDefaults={createPaymentPlanFormDefaults}
      createUpdatePayload={createPaymentPlanUpdatePayload}
      entityLabel={config.model.name}
      initialRecord={initialRecord}
      recordId={recordId}
      schema={paymentPlanRecordSchema}
      useLayout={usePaymentPlanLayout}
    />
  );
}
