import { MultiSelect } from "@kompaniya/ui-common/components/multi-select";
import { startTransition, useEffect, useMemo, useState } from "react";

import { env } from "@/env/client";

import type { RecordFieldOption } from "./layout";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";

export type TagRecordFieldProps = BaseRecordFieldProps<
  string[] | string | null | undefined
>;

const TAGS_ENDPOINT = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/tag`;

export function TagRecordField({
  description,
  editing,
  fallback,
  label,
  name,
  onBlur,
  onChange,
  options: optionsProp,
  placeholder,
  tag,
  value,
}: TagRecordFieldProps) {
  const [options, setOptions] = useState<RecordFieldOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const relatedType = tag?.relatedType?.trim() ?? "";
  const shouldFetch = relatedType.length > 0;

  const values = useMemo(() => normalizeValues(value), [value]);

  useEffect(() => {
    if (!shouldFetch) return;

    let active = true;
    const controller = new AbortController();

    startTransition(() => {
      setIsLoading(true);
      setError(null);
    });

    const url = new URL(TAGS_ENDPOINT);
    url.searchParams.set("relatedType", relatedType);

    fetch(url.toString(), {
      signal: controller.signal,
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        setOptions(normalizeTagOptions(data));
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load tags");
        setOptions([]);
        setIsLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [relatedType, shouldFetch]);

  const effectiveError = shouldFetch ? error : null;
  const effectiveIsLoading = shouldFetch ? isLoading : false;

  const normalizedOptions = useMemo(() => {
    const baseOptions = shouldFetch
      ? options
      : optionsProp && optionsProp.length > 0
        ? optionsProp
        : [];
    const fallbackOptions = values
      .filter((entry) => !baseOptions.some((option) => option.value === entry))
      .map((entry) => ({ label: entry, value: entry }));
    return [...baseOptions, ...fallbackOptions];
  }, [options, optionsProp, shouldFetch, values]);

  const valueToLabel = useMemo(() => {
    return new Map(
      normalizedOptions.map((option) => [option.value, option.label]),
    );
  }, [normalizedOptions]);

  if (!editing) {
    const displayValues = values.map(
      (entry) => valueToLabel.get(entry) ?? entry,
    );
    const renderedValue =
      displayValues.length > 0 ? displayValues.join(", ") : undefined;

    return (
      <div className="space-y-2">
        <RecordField fallback={fallback} label={label} value={renderedValue} />
        <FieldDescription description={description} />
        {effectiveError ? (
          <p className="text-xs text-destructive">{effectiveError}</p>
        ) : null}
      </div>
    );
  }

  const resolvedPlaceholder = effectiveIsLoading
    ? "Loading tags..."
    : (placeholder ?? "Select tags");

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <MultiSelect
        animation={0}
        defaultValue={values}
        disabled={effectiveIsLoading}
        key={values.join("|") || "empty"}
        onValueChange={(next) => {
          onChange?.(next);
          onBlur?.();
        }}
        options={normalizedOptions}
        placeholder={resolvedPlaceholder}
      />
      <FieldDescription description={description} />
      {effectiveError ? (
        <p className="text-xs text-destructive">{effectiveError}</p>
      ) : null}
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTagOptions(data: unknown): RecordFieldOption[] {
  const records = toRecordArray(data);

  return records
    .map((record) => {
      const rawName = record.name;
      if (rawName === null || rawName === undefined) return null;
      const name = String(rawName).trim();
      if (!name) return null;
      return { label: name, value: name };
    })
    .filter((option): option is RecordFieldOption => Boolean(option));
}

function normalizeValues(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
}

function toRecordArray(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((entry): entry is Record<string, unknown> =>
      isRecord(entry),
    );
  }

  if (isRecord(data)) {
    if (Array.isArray(data.data)) {
      return data.data.filter((entry): entry is Record<string, unknown> =>
        isRecord(entry),
      );
    }

    if (isRecord(data.data)) {
      return [data.data];
    }

    return [data];
  }

  return [];
}
