import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/leads";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const leadsEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_leads",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_leads",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  tagType: "lead",
  gridCardColumns: ["email", "status"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
  tableInitialState: {
    columnVisibility: {
      name: true,
      email: false,
    },
  },
};

export const useLeadsEntityConfig = () => leadsEntityConfig;
