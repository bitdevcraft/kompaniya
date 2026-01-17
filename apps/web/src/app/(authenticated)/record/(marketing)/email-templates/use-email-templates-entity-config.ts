import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/email-templates";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const emailTemplatesEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_email_templates",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_email_templates",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  gridCardColumns: ["email", "subject"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useEmailTemplatesEntityConfig = () => emailTemplatesEntityConfig;
