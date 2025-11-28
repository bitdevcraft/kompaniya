import { Input } from "@kompaniya/ui-common/components/input";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";

export type TextRecordFieldProps = BaseRecordFieldProps<
  string | null | undefined
>;

export function TextRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: TextRecordFieldProps) {
  if (!editing) {
    return (
      <div className="space-y-2">
        <RecordField fallback={fallback} label={label} value={value} />
        <FieldDescription description={description} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        id={name}
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        value={value ?? ""}
      />
      <FieldDescription description={description} />
    </div>
  );
}
