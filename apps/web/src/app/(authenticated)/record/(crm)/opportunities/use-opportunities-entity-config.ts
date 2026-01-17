import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/opportunities";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const opportunitiesEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_opportunities",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_opportunities",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  tagType: "opportunity",
  gridCardColumns: ["email", "status"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useOpportunitiesEntityConfig = () => opportunitiesEntityConfig;
