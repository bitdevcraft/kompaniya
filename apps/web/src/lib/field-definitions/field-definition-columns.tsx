"use client";

import type {
  FilterVariant,
  Option,
} from "@kompaniya/ui-data-table/types/data-table";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "@kompaniya/ui-data-table/components/data-table-column-header";
import { mapCustomFieldTypeToVariant } from "@kompaniya/ui-data-table/lib/custom-field-columns";
import { Text } from "lucide-react";

import type { NativeFieldDefinition } from "./types";

import { getFieldDefinitions } from "./registry";

const EMPTY_VALUE = "-";

const renderFieldValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">{EMPTY_VALUE}</span>;
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const TEXT_FIELD_TYPES = new Set([
  "html",
  "lookup",
  "mjml",
  "phone",
  "text",
  "textarea",
]);

const FIELD_TYPE_VARIANTS: Record<string, FilterVariant> = {
  text: "text",
  textarea: "text",
  phone: "text",
  html: "text",
  mjml: "text",
  lookup: "text",
  number: "number",
  date: "date",
  datetime: "dateRange",
  boolean: "boolean",
  picklist: "select",
  multipicklist: "multiSelectArray",
  tag: "multiSelectArray",
};

type TagOptionsByRelatedType = Record<string, Option[] | undefined>;

export function getFieldDefinitionColumns<
  TData extends Record<string, unknown>,
>(
  entityType: string,
  existingColumnIds: Set<string>,
  options?: {
    tagOptionsByRelatedType?: TagOptionsByRelatedType;
  },
): ColumnDef<TData>[] {
  const definitions = getFieldDefinitions(entityType);

  return definitions
    .filter((definition) => !existingColumnIds.has(definition.id))
    .map((definition) => {
      const variant = resolveVariant(definition);
      const optionsForField = resolveOptions(definition, options);
      const meta = {
        label: definition.label,
        placeholder: getPlaceholder(definition, variant),
        variant,
        options: optionsForField,
        icon: TEXT_FIELD_TYPES.has(definition.type) ? Text : undefined,
      };

      return {
        id: definition.id,
        accessorKey: definition.id,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={definition.label} />
        ),
        cell: (info) => renderFieldValue(info.getValue()),
        meta,
        enableSorting: true,
        enableColumnFilter: true,
      };
    });
}

function getPlaceholder(
  definition: NativeFieldDefinition,
  variant: FilterVariant,
): string | undefined {
  if (definition.placeholder) return definition.placeholder;

  if (variant !== "text") return undefined;

  return `Search ${definition.label.toLowerCase()}...`;
}

function resolveOptions(
  definition: NativeFieldDefinition,
  options?: {
    tagOptionsByRelatedType?: TagOptionsByRelatedType;
  },
): Option[] | undefined {
  if (definition.type === "tag") {
    const relatedType = definition.tag?.relatedType ?? "";
    const tagOptions = options?.tagOptionsByRelatedType?.[relatedType];
    return tagOptions?.length ? tagOptions : undefined;
  }

  if (definition.options && definition.options.length > 0) {
    return definition.options.map((option) => ({
      label: option.label,
      value: option.value,
    }));
  }

  return undefined;
}

function resolveVariant(definition: NativeFieldDefinition): FilterVariant {
  if (definition.isCustom && definition.customFieldType) {
    return mapCustomFieldTypeToVariant(
      definition.customFieldType as Parameters<
        typeof mapCustomFieldTypeToVariant
      >[0],
    );
  }

  return FIELD_TYPE_VARIANTS[definition.type] ?? "text";
}
