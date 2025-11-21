import { AsyncSelect } from "@repo/shared-ui/components/common/async-select";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { RecordField } from "./record-field";
import {
  type BaseRecordFieldProps,
  FieldDescription,
  FieldLabel,
} from "./record-field-types";
import { renderLink } from "./utils";

export type LookupRecordFieldProps = BaseRecordFieldProps<
  string | null | undefined
>;

interface NormalizedLookupRecord {
  description?: string;
  id: string;
  label: string;
  raw: Record<string, unknown>;
}

const DEFAULT_LABEL_KEY = "name";
const DEFAULT_VALUE_KEY = "id";
const DEFAULT_QUERY_PARAM = "name";
const DEFAULT_ID_PARAM = "id";

export function LookupRecordField({
  description,
  editing,
  fallback,
  label,
  lookup,
  name,
  onBlur,
  onChange,
  placeholder,
  value,
}: LookupRecordFieldProps) {
  const [selectedRecord, setSelectedRecord] =
    useState<NormalizedLookupRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalizedValue = useMemo(() => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    return String(value);
  }, [value]);

  const labelKey = lookup?.labelKey ?? DEFAULT_LABEL_KEY;
  const valueKey = lookup?.valueKey ?? DEFAULT_VALUE_KEY;
  const descriptionKey = lookup?.descriptionKey;
  const queryParam = lookup?.queryParam ?? DEFAULT_QUERY_PARAM;
  const idParam = lookup?.idParam ?? DEFAULT_ID_PARAM;
  const shouldFetch = Boolean(lookup) && normalizedValue.length > 0;

  const resolveRedirectUrl = useCallback(
    (id: string): string | undefined => {
      if (!lookup?.redirectBaseUrl) return undefined;
      const base = lookup.redirectBaseUrl;
      if (base.includes(":id")) {
        return base.replace(":id", encodeURIComponent(id));
      }
      if (base.includes("{id}")) {
        return base.replace("{id}", encodeURIComponent(id));
      }
      return `${base}${encodeURIComponent(id)}`;
    },
    [lookup],
  );

  const normalizeRecord = useCallback(
    (record: Record<string, unknown>): NormalizedLookupRecord | null => {
      const rawValue = record[valueKey];
      if (rawValue === null || rawValue === undefined) {
        return null;
      }

      const id = String(rawValue);
      const labelValue = record[labelKey] ?? rawValue;
      const descriptionValue = descriptionKey
        ? record[descriptionKey]
        : undefined;

      return {
        description:
          descriptionValue === null || descriptionValue === undefined
            ? undefined
            : String(descriptionValue),
        id,
        label: String(labelValue),
        raw: record,
      };
    },
    [descriptionKey, labelKey, valueKey],
  );

  const toArray = useCallback((data: unknown): Record<string, unknown>[] => {
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
  }, []);

  const buildUrl = useCallback((endpoint: string): string => {
    const base =
      typeof window === "undefined"
        ? "http://localhost"
        : window.location.origin;
    try {
      return new URL(endpoint, base).toString();
    } catch {
      return endpoint;
    }
  }, []);

  const buildSearchUrl = useCallback(
    (query?: string): string | undefined => {
      if (!lookup) return undefined;
      const baseUrl = buildUrl(lookup.searchEndpoint);
      const url = new URL(baseUrl);
      if (query !== undefined) {
        url.searchParams.set(queryParam, query);
      } else {
        url.searchParams.delete(queryParam);
      }
      return url.toString();
    },
    [buildUrl, lookup, queryParam],
  );

  const buildFindUrl = useCallback(
    (id: string): string | undefined => {
      if (!lookup) return undefined;
      const replaced = lookup.findByIdEndpoint
        .replace(":id", encodeURIComponent(id))
        .replace("{id}", encodeURIComponent(id));

      if (replaced !== lookup.findByIdEndpoint) {
        return buildUrl(replaced);
      }

      const url = new URL(buildUrl(lookup.findByIdEndpoint));
      if (lookup.findByIdEndpoint.includes("?")) {
        url.searchParams.set(idParam, id);
        return url.toString();
      }

      url.pathname = `${url.pathname.replace(/\/$/, "")}/${encodeURIComponent(id)}`;
      return url.toString();
    },
    [buildUrl, idParam, lookup],
  );

  const fetchJson = useCallback(
    async (url?: string, signal?: AbortSignal): Promise<unknown | null> => {
      if (!url) return null;
      const response = await fetch(url, { signal, credentials: "include" });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data as unknown;
    },
    [],
  );

  const fetchById = useCallback(
    async (
      id: string,
      signal?: AbortSignal,
    ): Promise<NormalizedLookupRecord | null> => {
      if (!lookup || !id) return null;
      const data = await fetchJson(buildFindUrl(id), signal);
      if (!data) return null;
      const [record] = toArray(data);
      if (!record) return null;
      return normalizeRecord(record);
    },
    [buildFindUrl, fetchJson, lookup, normalizeRecord, toArray],
  );

  const fetchSearch = useCallback(
    async (query?: string): Promise<NormalizedLookupRecord[]> => {
      if (!lookup) return [];
      const data = await fetchJson(buildSearchUrl(query));
      if (!data) return [];
      return toArray(data)
        .map((record) => normalizeRecord(record))
        .filter((record): record is NormalizedLookupRecord => Boolean(record));
    },
    [buildSearchUrl, fetchJson, lookup, normalizeRecord, toArray],
  );

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    let active = true;
    const controller = new AbortController();
    startTransition(() => {
      setError(null);
      setSelectedRecord(null);
    });

    fetchById(normalizedValue, controller.signal)
      .then((record) => {
        if (!active) return;
        setSelectedRecord(record);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load record");
        setSelectedRecord(null);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [fetchById, normalizedValue, shouldFetch]);

  const fetchOptions = useCallback(
    async (query?: string): Promise<NormalizedLookupRecord[]> => {
      if (!lookup) return [];
      const trimmed = query?.trim();

      if (trimmed && normalizedValue && trimmed === normalizedValue) {
        const record = await fetchById(normalizedValue);
        return record ? [record] : [];
      }

      const results = await fetchSearch(trimmed);
      if (results.length === 0 && normalizedValue) {
        const record = await fetchById(normalizedValue);
        return record ? [record] : results;
      }

      return results;
    },
    [fetchById, fetchSearch, lookup, normalizedValue],
  );

  const effectiveRecord = shouldFetch ? selectedRecord : null;
  const effectiveError = shouldFetch ? error : null;
  const isLoading = shouldFetch && !effectiveRecord && !effectiveError;

  if (!lookup) {
    return (
      <div className="space-y-2">
        <RecordField
          fallback={fallback}
          label={label}
          value={normalizedValue || undefined}
        />
        <FieldDescription description={description} />
      </div>
    );
  }

  if (!editing) {
    const displayLabel =
      effectiveRecord?.label ?? (isLoading ? "" : normalizedValue);
    const href = effectiveRecord?.id
      ? resolveRedirectUrl(effectiveRecord.id)
      : undefined;
    const renderedValue = href
      ? renderLink(displayLabel ?? undefined, href)
      : displayLabel;

    return (
      <div className="space-y-2">
        <RecordField
          fallback={fallback}
          label={label}
          value={effectiveError ? `${normalizedValue}` : renderedValue}
        />
        <FieldDescription description={description} />
        {effectiveError ? (
          <p className="text-xs text-destructive">{effectiveError}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <AsyncSelect<NormalizedLookupRecord>
        fetcher={fetchOptions}
        getDisplayValue={(option) => option.label}
        getOptionValue={(option) => option.id}
        label={label}
        onChange={(nextValue) => {
          const trimmedValue = nextValue.trim();
          const normalized = trimmedValue.length > 0 ? trimmedValue : "";
          onChange?.(normalized.length > 0 ? normalized : null);
          if (normalized.length === 0) {
            setSelectedRecord(null);
            setError(null);
          } else {
            void fetchById(normalized)
              .then((record) => {
                setSelectedRecord(record);
                setError(null);
              })
              .catch((err) => {
                setError(
                  err instanceof Error ? err.message : "Failed to load record",
                );
                setSelectedRecord(null);
              });
          }
          onBlur?.();
        }}
        placeholder={placeholder ?? "Search for a record"}
        renderOption={(option) => (
          <div className="flex flex-col">
            <span>{option.label}</span>
            {option.description ? (
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            ) : null}
          </div>
        )}
        triggerClassName="w-full justify-between"
        value={normalizedValue}
        width="100%"
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
