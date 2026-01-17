"use client";

import type { OrgContact } from "@repo/database/schema";

import type { RecordPageLayout } from "@/components/record-page/layout";

import { RecordEntityViewPage } from "@/components/record-entity";
import { useLayout } from "@/components/record-page/use-layout";

import type {
  ContactRecordFormValues,
  ContactRecordSubmitValues,
} from "./contact-record-schema";

import { useContactsEntityConfig } from "../../use-contacts-entity-config";
import {
  contactRecordSchema,
  createContactFormDefaults,
  createContactUpdatePayload as createContactUpdatePayloadOriginal,
} from "./contact-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgContact;
  recordId: string;
}

const contactRecordQueryKey = (recordId: string) =>
  ["contact-record", recordId] as const;

const useContactLayout = () =>
  useLayout(
    "org_contacts",
  ) as unknown as RecordPageLayout<ContactRecordFormValues>;

// Wrapper to handle type conversion between FormValues and SubmitValues
const createContactUpdatePayload = (
  record: OrgContact,
  values: ContactRecordFormValues,
  layout: RecordPageLayout<ContactRecordFormValues>,
): Partial<OrgContact> => {
  // Convert FormValues to SubmitValues (this is what zod schema.parse() does)
  const submitValues = contactRecordSchema.parse(
    values,
  ) as ContactRecordSubmitValues;
  return createContactUpdatePayloadOriginal(record, submitValues, layout);
};

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const config = useContactsEntityConfig();

  return (
    <RecordEntityViewPage<OrgContact, ContactRecordFormValues>
      config={{
        entityType: config.entityType,
        modelEndpoint: config.modelEndpoint,
        basePath: config.basePath,
        model: config.model,
        queryKey: contactRecordQueryKey,
      }}
      createFormDefaults={createContactFormDefaults}
      createUpdatePayload={createContactUpdatePayload}
      entityLabel={config.model.name}
      initialRecord={initialRecord}
      recordId={recordId}
      schema={contactRecordSchema}
      useLayout={useContactLayout}
    />
  );
}
