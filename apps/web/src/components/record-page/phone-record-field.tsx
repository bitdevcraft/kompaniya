import { PhoneInput } from "@repo/shared-ui/components/common/phone-input";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";
import { renderLink } from "./utils";

export type PhoneRecordFieldProps = BaseRecordFieldProps<string | null | undefined>;

export function PhoneRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: PhoneRecordFieldProps) {
  if (!editing) {
    const displayValue = typeof value === "string" && value.trim().length > 0
      ? renderLink(value, `tel:${value}`)
      : value;

    return (
      <div className="space-y-2">
        <RecordField fallback={fallback} label={label} value={displayValue} />
        <FieldDescription description={description} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <PhoneInput
        id={name}
        name={name}
        onBlur={onBlur}
        onChange={(next) => {
          const normalized = typeof next === "string" ? next : "";
          onChange?.(normalized);
        }}
        placeholder={placeholder ?? "+1 (555) 000-0000"}
        value={value ?? ""}
      />
      <FieldDescription description={description} />
    </div>
  );
}
