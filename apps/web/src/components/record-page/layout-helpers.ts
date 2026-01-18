import type { FieldValues } from "react-hook-form";

import type {
  FieldMode,
  RecordLayoutField,
  RecordLayoutSection,
  RecordPageLayout,
} from "./layout";

export function createDefaultValuesForLayout<
  TFieldValues extends FieldValues = FieldValues,
>(layout: RecordPageLayout<TFieldValues>) {
  const defaults: Record<string, unknown> = {};
  const fields = getAllLayoutFields(layout);

  for (const field of fields) {
    if (field.availableOnCreate === false || !isFieldEditable(field, true)) {
      continue;
    }

    switch (field.type) {
      case "boolean": {
        setValueAtPath(defaults, field.id as string, false);
        break;
      }
      case "multipicklist":
      case "tag": {
        setValueAtPath(defaults, field.id as string, []);
        break;
      }
      case "reference":
      case "number":
      case "date":
      case "datetime":
      case "picklist":
      case "phone":
      case "text":
      case "textarea":
      case "html":
      case "mjml":
      default: {
        setValueAtPath(defaults, field.id as string, "");
        break;
      }
    }
  }

  return defaults as TFieldValues;
}

export function extractCreateValues<TFieldValues extends FieldValues>(
  values: TFieldValues,
  layout: RecordPageLayout<TFieldValues>,
) {
  const fields = getCreateLayoutFields(layout);
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    const rawValue = getValueAtPath(
      values as Record<string, unknown>,
      field.id as string,
    );
    setValueAtPath(
      data,
      field.id as string,
      normalizeValueForSubmission(field, rawValue),
    );
  }

  return data;
}

export function getAllLayoutFields<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
): RecordLayoutField<TFieldValues>[] {
  const supplemental = layout.supplementalFields ?? [];
  const sections = collectAllSections(layout);
  const sectionFields = sections.flatMap((section) => section.fields);

  return [...sectionFields, ...supplemental];
}

export function getCreateLayoutFields<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
): RecordLayoutField<TFieldValues>[] {
  return getAllLayoutFields(layout).filter(
    (field) =>
      field.availableOnCreate !== false &&
      isFieldEditable(field, true) &&
      isFieldVisible(field, true),
  );
}

export function getEditableLayoutFields<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
  isCreateContext: boolean = false,
): RecordLayoutField<TFieldValues>[] {
  return getAllLayoutFields(layout).filter((field) =>
    isFieldEditable(field, isCreateContext),
  );
}

export function getValueAtPath(source: Record<string, unknown>, path: string) {
  if (!path.includes(".")) {
    return source[path];
  }

  const parts = path.split(".");
  let current: unknown = source;

  for (const part of parts) {
    if (!isRecord(current)) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Determines if a field is editable based on its mode and current context
 * @param field - The layout field to check
 * @param isCreateContext - Whether we're in a create context (vs update context)
 * @returns true if the field should be editable
 */
export function isFieldEditable<T extends FieldValues>(
  field: RecordLayoutField<T>,
  isCreateContext: boolean,
): boolean {
  // Handle legacy readOnly property for backward compatibility
  if (field.readOnly === true) {
    return false;
  }

  // If no fieldMode specified, default to "always" (editable)
  const mode = field.fieldMode ?? "always";

  switch (mode) {
    case "always":
      return true;
    case "createOnly":
      return isCreateContext;
    case "updateOnly":
      return !isCreateContext;
    case "immutable":
      return false;
    default:
      return true;
  }
}

/**
 * Determines if a field should be visible based on its mode and context
 * For updateOnly fields, they should be hidden on create forms
 * @param field - The layout field to check
 * @param isCreateContext - Whether we're in a create context
 * @returns true if the field should be visible
 */
export function isFieldVisible<T extends FieldValues>(
  field: RecordLayoutField<T>,
  isCreateContext: boolean,
): boolean {
  const mode = field.fieldMode ?? "always";

  // updateOnly fields are hidden on create forms
  if (mode === "updateOnly" && isCreateContext) {
    return false;
  }

  return true;
}

/**
 * Normalizes a field to use fieldMode, converting legacy readOnly
 */
export function normalizeFieldMode<T extends FieldValues>(
  field: RecordLayoutField<T>,
): RecordLayoutField<T> {
  if (field.readOnly === true && !field.fieldMode) {
    return { ...field, fieldMode: "immutable" as FieldMode };
  }
  return field;
}

export function normalizeValueForForm(
  field: RecordLayoutField,
  value: unknown,
): unknown {
  switch (field.type) {
    case "boolean": {
      return Boolean(value);
    }
    case "number": {
      if (value === null || value === undefined) return "";
      return typeof value === "number" ? value.toString() : String(value);
    }
    case "date": {
      return toDateInputValue(value);
    }
    case "datetime": {
      return toDateTimeInputValue(value);
    }
    case "multipicklist":
    case "tag": {
      if (Array.isArray(value)) {
        return value.filter((entry) => typeof entry === "string");
      }
      if (typeof value === "string") {
        return value
          .split(/\n|,/)
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
      return [];
    }
    case "picklist": {
      if (value === null || value === undefined) return "";
      return String(value);
    }
    case "reference": {
      if (value === null || value === undefined) return "";
      return String(value);
    }
    case "phone":
    case "html":
    case "mjml":
    case "textarea":
    default: {
      if (value === null || value === undefined) return "";
      return String(value);
    }
  }
}

export function normalizeValueForSubmission<TFieldValues extends FieldValues>(
  field: RecordLayoutField<TFieldValues>,
  value: unknown,
): unknown {
  switch (field.type) {
    case "boolean": {
      return Boolean(value);
    }
    case "number": {
      if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
      }
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) return null;
        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    }
    case "date":
    case "datetime": {
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
      return null;
    }
    case "multipicklist":
    case "tag": {
      if (Array.isArray(value)) {
        return value.filter(
          (entry): entry is string => typeof entry === "string",
        );
      }
      if (typeof value === "string") {
        return value
          .split(/\n|,/)
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
      return [];
    }
    case "picklist":
    case "html":
    case "mjml":
    case "phone":
    case "reference":
    case "text":
    case "textarea": {
      if (typeof value !== "string") return null;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    default: {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      return value ?? null;
    }
  }
}

export function setValueAtPath(
  target: Record<string, unknown>,
  path: string,
  value: unknown,
) {
  if (!path.includes(".")) {
    target[path] = value;
    return;
  }

  const parts = path.split(".");
  let current: Record<string, unknown> = target;

  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index];
    const isLast = index === parts.length - 1;

    if (isLast) {
      current[part] = value;
      return;
    }

    const next = current[part];
    if (!isRecord(next)) {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
}

export function toDateInputValue(value: unknown) {
  if (!value) return "";

  const date = normalizeDate(value);
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function toDateTimeInputValue(value: unknown) {
  if (!value) return "";

  const date = normalizeDate(value);
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function collectAllSections<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
): RecordLayoutSection<TFieldValues>[] {
  const sections: RecordLayoutSection<TFieldValues>[] = [];

  if (layout.sections) {
    sections.push(...layout.sections);
  }

  const columns = layout.sectionColumns;
  if (columns?.header?.sections) {
    sections.push(...columns.header.sections);
  }
  if (columns?.firstColumn?.sections) {
    sections.push(...columns.firstColumn.sections);
  }
  if (columns?.secondColumn?.sections) {
    sections.push(...columns.secondColumn.sections);
  }

  return sections;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeDate(value: unknown) {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}
