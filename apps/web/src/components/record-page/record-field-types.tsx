import type { ReactNode } from "react";

import {
  FieldOption as RecordFieldOption,
  ReferenceFieldConfig,
  TagFieldConfig,
} from "@repo/domain";

export interface BaseRecordFieldProps<TValue> {
  description?: string;
  editing: boolean;
  fallback?: string;
  reference?: ReferenceFieldConfig;
  label: string;
  name?: string;
  onBlur?: () => void;
  onChange?: (value: TValue) => void;
  placeholder?: string;
  options?: RecordFieldOption[];
  record?: Record<string, unknown>;
  tag?: TagFieldConfig;
  value?: TValue;
}

export function FieldDescription({ description }: { description?: string }) {
  if (!description) return null;

  return (
    <p
      className="text-xs text-muted-foreground"
      data-slot="record-field-description"
    >
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
