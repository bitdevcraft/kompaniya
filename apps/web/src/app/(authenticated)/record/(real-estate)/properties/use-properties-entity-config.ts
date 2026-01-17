import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/properties";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const propertiesEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_real_estate_properties",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_real_estate_properties",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  gridCardColumns: ["status", "type"],
  tableTitle: "Properties",
};

export const usePropertiesEntityConfig = () => propertiesEntityConfig;
