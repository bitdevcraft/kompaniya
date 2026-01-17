"use client";

import type { OrgPaymentPlanTemplate } from "@repo/database/schema";

import type { RecordPageLayout } from "@/components/record-page/layout";

import { RecordEntityViewPage } from "@/components/record-entity";
import { useLayout } from "@/components/record-page/use-layout";

import type { PaymentPlanTemplateRecordSubmitValues } from "./payment-plan-template-record-schema";

import { usePaymentPlanTemplatesEntityConfig } from "../../use-payment-plan-templates-entity-config";
import {
  createPaymentPlanTemplateFormDefaults,
  createPaymentPlanTemplateUpdatePayload,
  paymentPlanTemplateRecordSchema,
} from "./payment-plan-template-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgPaymentPlanTemplate;

  recordId: string;
}

const paymentPlanTemplateRecordQueryKey = (recordId: string) =>
  ["payment-plan-template-record", recordId] as const;

const usePaymentPlanTemplateLayout = () =>
  useLayout(
    "org_payment_plan_templates",
  ) as unknown as RecordPageLayout<PaymentPlanTemplateRecordSubmitValues>;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const config = usePaymentPlanTemplatesEntityConfig();

  return (
    <RecordEntityViewPage<
      OrgPaymentPlanTemplate,
      PaymentPlanTemplateRecordSubmitValues
    >
      config={{
        entityType: config.entityType,
        modelEndpoint: config.modelEndpoint,
        basePath: config.basePath,
        model: config.model,
        queryKey: paymentPlanTemplateRecordQueryKey,
      }}
      createFormDefaults={createPaymentPlanTemplateFormDefaults}
      createUpdatePayload={createPaymentPlanTemplateUpdatePayload}
      entityLabel={config.model.label ?? "payment-plan-template"}
      initialRecord={initialRecord}
      recordId={recordId}
      schema={paymentPlanTemplateRecordSchema}
      useLayout={usePaymentPlanTemplateLayout}
    />
  );
}
