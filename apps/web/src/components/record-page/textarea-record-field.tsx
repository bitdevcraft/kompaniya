import { Textarea } from "@kompaniya/ui-common/components/textarea";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";

export type TextareaRecordFieldProps = BaseRecordFieldProps<
  string | null | undefined
>;

export function TextareaRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: TextareaRecordFieldProps) {
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
      <Textarea
        id={name}
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        rows={5}
        value={value ?? ""}
      />
      <FieldDescription description={description} />
    </div>
  );
}
