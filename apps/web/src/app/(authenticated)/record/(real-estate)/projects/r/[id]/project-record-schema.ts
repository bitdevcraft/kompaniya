import type { OrgRealEstateProject } from "@repo/database/schema";

import { z } from "zod";

import { type RecordPageLayout } from "@/components/record-page/layout";
import {
  getAllLayoutFields,
  getEditableLayoutFields,
  getValueAtPath,
  normalizeValueForForm,
  normalizeValueForSubmission,
  setValueAtPath,
} from "@/components/record-page/layout-helpers";

export const projectRecordSchema = z.object({
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  createdAt: z.string().optional(),
  description: z.string().optional(),
  developerName: z.string().optional(),
  expectedCompletionYear: z.string().optional(),
  launchYear: z.string().optional(),
  name: z.string().optional(),
  state: z.string().optional(),
  status: z.string().optional(),
  totalUnits: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ProjectRecordFormValues = z.input<typeof projectRecordSchema>;
export type ProjectRecordSubmitValues = z.output<typeof projectRecordSchema>;

export function createProjectFormDefaults(
  record: OrgRealEstateProject,
  layout: RecordPageLayout<ProjectRecordFormValues>,
): ProjectRecordFormValues {
  const defaults: Record<string, unknown> = {};

  for (const field of getAllLayoutFields(layout)) {
    const value = getValueAtPath(
      record as Record<string, unknown>,
      field.id as string,
    );
    const normalized = normalizeValueForForm(field, value);
    setValueAtPath(defaults, field.id as string, normalized);
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
    const fieldId = field.id as string;
    const value = getValueAtPath(values as Record<string, unknown>, fieldId);
    const normalized = normalizeValueForSubmission(field, value);
    (updates as Record<string, unknown>)[fieldId] = normalized;
  }

  return {
    ...updates,
    id: record.id,
  };
}
