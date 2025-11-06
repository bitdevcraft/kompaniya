import type { ReactNode } from "react";

export interface RecordFieldProps {
  fallback?: string;
  label: string;
  value?: ReactNode;
}

export function RecordField({ fallback = "Not provided", label, value }: RecordFieldProps) {
  const renderedValue = normalizeValue(value);

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="text-sm font-medium leading-6 text-foreground">
        {renderedValue ?? <span className="text-muted-foreground">{fallback}</span>}
      </div>
    </div>
  );
}

function normalizeValue(value?: ReactNode) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    return value.trim().length > 0 ? value : null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toString() : null;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return value;
}
