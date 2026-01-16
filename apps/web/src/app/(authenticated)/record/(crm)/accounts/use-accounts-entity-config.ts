import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/accounts";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const accountsEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_accounts",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_accounts",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  tagType: "account",
  gridCardColumns: ["email", "status"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useAccountsEntityConfig = () => accountsEntityConfig;
