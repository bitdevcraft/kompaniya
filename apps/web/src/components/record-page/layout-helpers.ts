import type { FieldValues } from "react-hook-form";

import type { RecordLayoutField, RecordPageLayout } from "./layout";

export function getAllLayoutFields<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
): RecordLayoutField<TFieldValues>[] {
  const supplemental = layout.supplementalFields ?? [];
  const sectionFields = layout.sections.flatMap((section) => section.fields);

  return [...sectionFields, ...supplemental];
}

export function getEditableLayoutFields<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
): RecordLayoutField<TFieldValues>[] {
  return getAllLayoutFields(layout).filter((field) => !field.readOnly);
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
    case "multipicklist": {
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
    default: {
      if (value === null || value === undefined) return "";
      return String(value);
    }
  }
}

export function normalizeValueForSubmission(
  field: RecordLayoutField,
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
    case "multipicklist": {
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
    case "text": {
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
