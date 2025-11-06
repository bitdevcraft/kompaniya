import type { ReactNode } from "react";

import { Input } from "@repo/shared-ui/components/common/input";
import { Textarea } from "@repo/shared-ui/components/common/textarea";

import { RecordField, type RecordFieldProps } from "./record-field";

export interface EditableRecordFieldProps extends Omit<RecordFieldProps, "value"> {
  editing: boolean;
  multiline?: boolean;
  name: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  type?: React.ComponentProps<typeof Input>["type"];
  value?: Primitive;
  renderValue?: (value?: Primitive) => ReactNode;
}

type Primitive = string | number | null | undefined;

export function EditableRecordField({
  editing,
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
  multiline = false,
  fallback,
  renderValue,
}: EditableRecordFieldProps) {
  if (!editing) {
    const rendered = renderValue ? renderValue(value) : value;

    return <RecordField fallback={fallback} label={label} value={rendered} />;
  }

  const normalizedValue = value ?? "";

  return (
    <div className="space-y-1.5">
      <label
        className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        htmlFor={name}
      >
        {label}
      </label>
      {multiline ? (
        <Textarea
          className="min-h-[120px]"
          id={name}
          name={name}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          value={String(normalizedValue)}
        />
      ) : (
        <Input
          id={name}
          name={name}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          type={type}
          value={String(normalizedValue)}
        />
      )}
    </div>
  );
}
