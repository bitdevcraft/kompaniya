import { Checkbox } from "@repo/shared-ui/components/common/checkbox";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";

export type BooleanRecordFieldProps = BaseRecordFieldProps<
  boolean | null | undefined
>;

export function BooleanRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  value,
}: BooleanRecordFieldProps) {
  if (!editing) {
    const displayValue =
      typeof value === "boolean" ? (value ? "Yes" : "No") : value;

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
      <div className="flex items-center gap-2">
        <Checkbox
          checked={Boolean(value)}
          id={name}
          onCheckedChange={(checked) => {
            onChange?.(Boolean(checked));
            onBlur?.();
          }}
        />
        <span className="text-sm text-muted-foreground">
          {value ? "Enabled" : "Disabled"}
        </span>
      </div>
      <FieldDescription description={description} />
    </div>
  );
}
