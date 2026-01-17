import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/email-campaigns";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const emailCampaignsEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_email_campaigns",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_email_campaigns",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  gridCardColumns: ["status", "scheduledFor", "sentCount"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useEmailCampaignsEntityConfig = () => emailCampaignsEntityConfig;
