import type { OrgRealEstateProject } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  normalizeValueForForm,
  normalizeValueForSubmission,
} from "@/components/record-page/layout-helpers";

export const projectRecordSchema = z.object({
  createdAt: z.string().optional(),
  name: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ProjectRecordFormValues = z.input<typeof projectRecordSchema>;
export type ProjectRecordSubmitValues = z.output<typeof projectRecordSchema>;

export function createProjectFormDefaults(
  record: OrgRealEstateProject,
  layout: RecordPageLayout<ProjectRecordFormValues>,
): ProjectRecordFormValues {
  const defaults: Partial<ProjectRecordFormValues> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = (record as Record<string, unknown>)[field.id as string];
    const normalized = normalizeValueForForm(field, value);

    defaults[field.id] = normalized as ProjectRecordFormValues[typeof field.id];
  }

  return defaults as ProjectRecordFormValues;
}

export function createProjectUpdatePayload(
  record: OrgRealEstateProject,
  values: ProjectRecordSubmitValues,
  layout: RecordPageLayout<ProjectRecordFormValues>,
): Partial<OrgRealEstateProject> {
  const updates: Partial<OrgRealEstateProject> = {};
  const editable = getEditableLayoutFields(layout);

  for (const field of editable) {
    const value = values[field.id];
    // @ts-expect-error type
    updates[field.id as keyof OrgRealEstateProject] =
      normalizeValueForSubmission(
        field,
        value,
      ) as OrgRealEstateProject[keyof OrgRealEstateProject];
  }

  return {
    ...updates,
    id: record.id,
  };
}
