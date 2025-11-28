"use client";

import { parseAsString, useQueryState, type UseQueryStateOptions } from "nuqs";
import * as React from "react";

export type DataTableViewMode = "table" | "grid";

const DEFAULT_VIEW_MODE: DataTableViewMode = "table";
const DEFAULT_VIEW_MODE_KEY = "view";

export interface UseDataTableViewModeOptions
  extends Omit<UseQueryStateOptions<string>, "parse"> {
  key?: string;
  defaultValue?: DataTableViewMode;
}

export function useDataTableViewMode({
  key = DEFAULT_VIEW_MODE_KEY,
  defaultValue = DEFAULT_VIEW_MODE,
  ...queryStateOptions
}: UseDataTableViewModeOptions = {}) {
  const [rawViewMode, setRawViewMode] = useQueryState(
    key,
    parseAsString.withOptions(queryStateOptions).withDefault(defaultValue),
  );

  const viewMode = React.useMemo<DataTableViewMode>(() => {
    if (isDataTableViewMode(rawViewMode)) {
      return rawViewMode;
    }

    return defaultValue;
  }, [rawViewMode, defaultValue]);

  const setViewMode = React.useCallback(
    (
      nextValue:
        | DataTableViewMode
        | ((previous: DataTableViewMode) => DataTableViewMode),
    ) => {
      const value =
        typeof nextValue === "function" ? nextValue(viewMode) : nextValue;

      if (!isDataTableViewMode(value)) {
        return;
      }

      void setRawViewMode(value);
    },
    [setRawViewMode, viewMode],
  );

  return [viewMode, setViewMode] as const;
}

function isDataTableViewMode(
  value: string | null | undefined,
): value is DataTableViewMode {
  return value === "table" || value === "grid";
}
