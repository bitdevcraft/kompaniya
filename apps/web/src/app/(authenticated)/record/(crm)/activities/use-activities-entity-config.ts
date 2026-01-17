import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/activities";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const activitiesEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_activities",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_activities",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  gridCardColumns: ["status"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useActivitiesEntityConfig = () => activitiesEntityConfig;
