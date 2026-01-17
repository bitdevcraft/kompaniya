import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/email-domains";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const emailDomainsEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_email_domains",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_email_domains",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useEmailDomainsEntityConfig = () => emailDomainsEntityConfig;
