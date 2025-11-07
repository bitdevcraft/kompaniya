import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/shared-ui/components/common/select";

import type { RecordFieldOption } from "./layout";

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

export type PicklistRecordFieldProps = BaseRecordFieldProps<
  string | null | undefined
>;

export function PicklistRecordField({
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
}: PicklistRecordFieldProps) {
  const normalizedOptions =
    optionsProp && optionsProp.length > 0 ? optionsProp : DEFAULT_OPTIONS;

  const normalizedValue = typeof value === "string" ? value : undefined;
  const displayLabel = normalizedOptions.find(
    (option) => option.value === normalizedValue,
  )?.label;

  if (!editing) {
    return (
      <div className="space-y-2">
        <RecordField
          fallback={fallback}
          label={label}
          value={displayLabel ?? normalizedValue ?? value}
        />
        <FieldDescription description={description} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Select
        onValueChange={(next) => {
          onChange?.(next);
          onBlur?.();
        }}
        value={normalizedValue}
      >
        <SelectTrigger id={name}>
          <SelectValue placeholder={placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {normalizedOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription description={description} />
    </div>
  );
}
