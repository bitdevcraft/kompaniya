import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/projects";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const projectsEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_real_estate_projects",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_real_estate_projects",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  gridCardColumns: ["status"],
  tableTitle: "Projects",
};

export const useProjectsEntityConfig = () => projectsEntityConfig;
