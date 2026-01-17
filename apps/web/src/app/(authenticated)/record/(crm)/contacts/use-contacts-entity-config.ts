import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/contacts";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const contactsEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_contacts",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_contacts",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  tagType: "contact",
  gridCardColumns: ["email", "status"],
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useContactsEntityConfig = () => contactsEntityConfig;
