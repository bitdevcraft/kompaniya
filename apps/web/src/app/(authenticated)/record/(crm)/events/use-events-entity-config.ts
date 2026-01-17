import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/events";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const eventsEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_events",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_events",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  tagType: "event",
  gridCardColumns: ["startDate", "status"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useEventsEntityConfig = () => eventsEntityConfig;
