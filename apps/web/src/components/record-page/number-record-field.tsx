import { Input } from "@repo/shared-ui/components/common/input";

import { RecordField } from "./record-field";
import {
  FieldDescription,
  FieldLabel,
  type BaseRecordFieldProps,
} from "./record-field-types";
import { formatScore } from "./utils";

export type NumberRecordFieldProps = BaseRecordFieldProps<string | number | null | undefined>;

export function NumberRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: NumberRecordFieldProps) {
  if (!editing) {
    const formattedValue =
      value === null || value === undefined ? value : formatScore(value);

    return (
      <div className="space-y-2">
        <RecordField fallback={fallback} label={label} value={formattedValue} />
        <FieldDescription description={description} />
      </div>
    );
  }

  const normalizedValue =
    typeof value === "number" || typeof value === "string" ? String(value) : "";

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        inputMode="decimal"
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        type="number"
        value={normalizedValue}
      />
      <FieldDescription description={description} />
    </div>
  );
}
