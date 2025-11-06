import type { ReactNode } from "react";

interface NameRecord {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
}

export function buildDisplayName(record: NameRecord, fallback: string) {
  if (record.name && record.name.trim().length > 0) {
    return record.name;
  }

  const combined = [record.firstName, record.lastName].filter(isPresent).join(" ");
  return combined.length > 0 ? combined : fallback;
}

export function formatDateTime(value?: string | Date | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return null;

  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) return null;

  const formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  });

  return formatter.format(date);
}

export function formatScore(score: unknown) {
  if (score === null || score === undefined) return null;

  const value = typeof score === "number" ? score : Number(score);

  if (!Number.isFinite(value)) return String(score);

  return value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

export function getInitials(name: string) {
  const matches = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean);

  return matches.slice(0, 2).join("") || "?";
}

export function isPresent<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false;
  return String(value).trim().length > 0;
}

export function renderLink(value?: string | null, href?: string): ReactNode {
  if (!value) return null;

  const normalizedHref = href ?? (value.startsWith("http") ? value : undefined);

  if (!normalizedHref) {
    return value;
  }

  return (
    <a
      className="text-primary underline-offset-4 hover:underline"
      href={normalizedHref}
      rel="noreferrer"
      target={normalizedHref.startsWith("http") ? "_blank" : undefined}
    >
      {value}
    </a>
  );
}
