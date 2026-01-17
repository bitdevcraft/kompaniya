import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import { model, modelEndpoint, type tableType } from "./config";

const basePath = "/record/payment-plan-templates";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const paymentPlanTemplatesEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_payment_plan_templates",
  model,
  modelEndpoint,
  dictTranslation: "realEstate.paymentPlanTemplate",
  tablePreferencesEntityType: "org_payment_plan_templates",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  gridCardColumns: ["code", "name"],
  tableTitle: model.label ?? convertCase(model.plural, "kebab", "title"),
};

export const usePaymentPlanTemplatesEntityConfig = () =>
  paymentPlanTemplatesEntityConfig;
