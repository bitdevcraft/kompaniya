import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/bookings";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const bookingsEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_real_estate_bookings",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_real_estate_bookings",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "name",
    header: "Name",
    linkTemplate: recordPath,
  },
  gridCardColumns: ["status"],
  tableTitle: "Bookings",
};

export const useBookingsEntityConfig = () => bookingsEntityConfig;
