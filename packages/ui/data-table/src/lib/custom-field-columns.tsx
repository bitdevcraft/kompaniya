import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import * as React from "react";

import type { FilterVariant } from "../types/data-table";

/**
 * Choice option for select fields
 */
export interface ChoiceOption {
  label: string;
  value: string;
}

/**
 * Extended column meta type for custom fields
 */
export interface CustomFieldColumnMeta {
  label?: string;
  variant?: FilterVariant;
  options?: ChoiceOption[];
  isCustomField?: boolean;
  customFieldKey?: string;
  customFieldType?: CustomFieldType;
}

/**
 * Custom field definition interface
 */
export interface CustomFieldDefinition {
  id: string;
  key: string;
  label: string;
  description?: string;
  fieldType: CustomFieldType;
  isRequired: boolean;
  defaultValue?: unknown;
  choices?: ChoiceOption[];
  validation?: Record<string, unknown>;
  isIndexed: boolean;
}

/**
 * Custom field type enumeration
 */
export type CustomFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "single_select"
  | "multi_select"
  | "json"
  | "reference";

/**
 * Base type for rows with custom fields
 */
export type TableRowWithCustomFields = {
  id: string;
  customFields?: Record<string, unknown> | null;
  [key: string]: unknown;
};

/**
 * Declare the extended column meta type in Tanstack Table module
 */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    isCustomField?: boolean;
    customFieldKey?: string;
    customFieldType?: CustomFieldType;
  }
}

/**
 * Create a column helper for a specific table row type
 */
export function createCustomFieldColumnHelper<
  T extends TableRowWithCustomFields,
>() {
  return createColumnHelper<T>();
}

/**
 * Generate Tanstack Table column definitions from custom field definitions
 * Using createColumnHelper for type-safe column definitions
 */
export function generateCustomFieldColumns<T extends TableRowWithCustomFields>(
  definitions: CustomFieldDefinition[],
): ColumnDef<T>[] {
  const columnHelper = createCustomFieldColumnHelper<T>();

  return definitions.map((definition) =>
    columnHelper.accessor(
      (row) => row.customFields?.[definition.key] as unknown,
      {
        id: `customFields.${definition.key}`,
        header: definition.label,
        cell: (info) => {
          const value = info.getValue();
          return renderCustomFieldValue(
            value,
            definition.fieldType,
            definition.choices,
          );
        },
        meta: {
          label: definition.label,
          variant: mapCustomFieldTypeToVariant(definition.fieldType),
          options: definition.choices,
          isCustomField: true,
          customFieldKey: definition.key,
          customFieldType: definition.fieldType,
        },
        enableColumnFilter: true,
        enableSorting: true,
      },
    ),
  );
}

/**
 * Extract custom field key from column ID
 */
export function getCustomFieldKey(columnId: string): string | null {
  if (columnId.startsWith("customFields.")) {
    return columnId.replace("customFields.", "");
  }
  return null;
}

/**
 * Check if a column ID is a custom field
 */
export function isCustomFieldColumn(columnId: string): boolean {
  return columnId.startsWith("customFields.");
}

/**
 * Map custom field type to filter variant
 */
export function mapCustomFieldTypeToVariant(
  fieldType: CustomFieldType,
): FilterVariant {
  const mapping: Record<CustomFieldType, FilterVariant> = {
    string: "text",
    number: "number",
    boolean: "boolean",
    date: "date",
    datetime: "dateRange",
    single_select: "select",
    multi_select: "multiSelectArray",
    json: "text",
    reference: "text",
  };
  return mapping[fieldType];
}

/**
 * Render custom field value based on type
 */
export function renderCustomFieldValue(
  value: unknown,
  fieldType: CustomFieldType,
  choices?: ChoiceOption[],
): React.ReactNode {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  switch (fieldType) {
    case "string":
      return typeof value === "string" ? value : String(value);

    case "number":
      return typeof value === "number" ? value.toLocaleString() : String(value);

    case "boolean": {
      const boolValue = typeof value === "boolean" ? value : value === "true";
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            boolValue
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
          }`}
        >
          {boolValue ? "Yes" : "No"}
        </span>
      );
    }

    case "date":
    case "datetime": {
      const date =
        typeof value === "string" ? new Date(value) : (value as Date);
      if (Number.isNaN(date.getTime())) {
        return <span className="text-muted-foreground">—</span>;
      }
      try {
        return format(
          date,
          fieldType === "date" ? "MMM dd, yyyy" : "MMM dd, yyyy HH:mm",
        );
      } catch {
        return String(value);
      }
    }

    case "single_select": {
      const strValue = String(value);
      const choice = choices?.find((c) => c.value === strValue);
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {choice?.label ?? strValue}
        </span>
      );
    }

    case "multi_select": {
      if (!Array.isArray(value)) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, index) => {
            const strValue = String(item);
            const choice = choices?.find((c) => c.value === strValue);
            return (
              <span
                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                key={index}
              >
                {choice?.label ?? strValue}
              </span>
            );
          })}
        </div>
      );
    }

    case "json":
      return (
        <span className="text-muted-foreground text-xs">
          {typeof value === "object" ? "{...}" : String(value)}
        </span>
      );

    case "reference":
      return typeof value === "object" && value !== null && "id" in value
        ? (value as { id: string }).id
        : String(value);

    default:
      return String(value);
  }
}
