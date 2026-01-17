import { convertCase } from "@repo/shared/utils";

import type { RecordEntityConfig } from "@/components/record-entity";

import {
  dictTranslation,
  model,
  modelEndpoint,
  type tableType,
} from "./config";

const basePath = "/record/email-test-receivers";
const recordPath = (id: string) => `${basePath}/r/${id}`;

const emailTestReceiversEntityConfig: RecordEntityConfig<tableType> = {
  entityType: "org_email_test_receivers",
  model,
  modelEndpoint,
  dictTranslation,
  tablePreferencesEntityType: "org_email_test_receivers",
  basePath,
  recordPath,
  primaryColumn: {
    accessorKey: "emails",
    header: "Email",
    linkTemplate: recordPath,
  },
  renderTitle: (row) => {
    const emails = row.emails as string | null | undefined;
    return emails ?? "";
  },
  tableTitle: convertCase(model.plural, "kebab", "title"),
};

export const useEmailTestReceiversEntityConfig = () =>
  emailTestReceiversEntityConfig;
