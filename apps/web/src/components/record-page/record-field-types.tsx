import type { ReactNode } from "react";

import type { RecordFieldOption } from "./layout";

export interface BaseRecordFieldProps<TValue> {
  description?: string;
  editing: boolean;
  fallback?: string;
  label: string;
  name?: string;
  onBlur?: () => void;
  onChange?: (value: TValue) => void;
  placeholder?: string;
  options?: RecordFieldOption[];
  value?: TValue;
}

export function FieldDescription({ description }: { description?: string }) {
  if (!description) return null;

  return (
    <p className="text-xs text-muted-foreground" data-slot="record-field-description">
      {description}
    </p>
  );
}

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      htmlFor={htmlFor}
    >
      {children}
    </label>
  );
}
