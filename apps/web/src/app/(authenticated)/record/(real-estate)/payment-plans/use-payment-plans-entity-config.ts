import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/payment-plans";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const paymentPlansEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_payment_plans",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_payment_plans",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  gridCardColumns: ["status", "totalAmount"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const usePaymentPlansEntityConfig = () => paymentPlansEntityConfig;
