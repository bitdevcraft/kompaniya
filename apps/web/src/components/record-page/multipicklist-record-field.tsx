import { Badge } from "@kompaniya/ui-common/components/badge";
import { MultiSelect } from "@kompaniya/ui-common/components/multi-select";
import { FieldOption as RecordFieldOption } from "@repo/domain";
import { useMemo } from "react";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";

const DEFAULT_OPTIONS: RecordFieldOption[] = [
  { label: "item 1", value: "item 1" },
  { label: "item 2", value: "item 2" },
  { label: "item 3", value: "item 3" },
];

export type MultipicklistRecordFieldProps = BaseRecordFieldProps<
  string[] | string | null | undefined
>;

export function MultipicklistRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  options: optionsProp,
  placeholder,
  value,
}: MultipicklistRecordFieldProps) {
  const values = useMemo(() => normalizeValues(value), [value]);
  const normalizedOptions = useMemo(() => {
    return optionsProp && optionsProp.length > 0
      ? optionsProp
      : DEFAULT_OPTIONS;
  }, [optionsProp]);
  const valueToLabel = useMemo(() => {
    return new Map(
      normalizedOptions.map((option) => [option.value, option.label]),
    );
  }, [normalizedOptions]);

  if (!editing) {
    return (
      <div className="space-y-2">
        <RecordField
          fallback={fallback}
          label={label}
          value={
            values.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {values.map((entry) => (
                  <Badge key={`${name ?? label}-${entry}`} variant="secondary">
                    {valueToLabel.get(entry) ?? entry}
                  </Badge>
                ))}
              </div>
            ) : undefined
          }
        />
        <FieldDescription description={description} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <MultiSelect
        animation={0}
        defaultValue={values}
        key={values.join("|") || "empty"}
        onValueChange={(next) => {
          onChange?.(next);
          onBlur?.();
        }}
        options={normalizedOptions}
        placeholder={placeholder ?? "Select options"}
      />
      <FieldDescription description={description} />
    </div>
  );
}

function normalizeValues(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
}
