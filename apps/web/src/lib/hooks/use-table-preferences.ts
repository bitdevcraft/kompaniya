"use client";

import type { ColumnVisibilityState } from "@repo/database/schema";
import type { Table } from "@tanstack/react-table";

import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";

import { env } from "@/env/client";

type TablePreferencesResponse = {
  entityType: string;
  preferences: {
    visibility: ColumnVisibilityState;
  };
  isCustomized: boolean;
  isDefault: boolean;
};

type UseTablePreferencesParams<TData> = {
  entityType: string;
  table: Table<TData>;
  organizationId?: string;
  enabled?: boolean;
  lockVisibleColumns?: string[];
};

const tablePreferencesEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/table-preferences`;
const DEFAULT_LOCKED_COLUMNS = ["name"];

export function useTablePreferences<TData>({
  entityType,
  table,
  organizationId,
  enabled = true,
  lockVisibleColumns = DEFAULT_LOCKED_COLUMNS,
}: UseTablePreferencesParams<TData>) {
  const preferencesQuery = useQuery({
    queryKey: ["table-preferences", entityType, organizationId],
    enabled: enabled && Boolean(organizationId),
    queryFn: async () => {
      const response = await axios.get<TablePreferencesResponse>(
        `${tablePreferencesEndpoint}/${entityType}`,
        { withCredentials: true },
      );
      return response.data;
    },
  });

  const { mutate: saveTablePreferences } = useMutation({
    mutationFn: async (visibility: ColumnVisibilityState) => {
      const response = await axios.patch<TablePreferencesResponse>(
        `${tablePreferencesEndpoint}/${entityType}`,
        { visibility },
        { withCredentials: true },
      );
      return response.data;
    },
  });

  const hasAppliedPreferences = React.useRef(false);
  const lastSavedVisibility = React.useRef<string | null>(null);
  const saveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [isReady, setIsReady] = React.useState(!enabled || !organizationId);

  const normalizeVisibility = React.useCallback(
    (visibility: ColumnVisibilityState) => {
      const nextVisibility: ColumnVisibilityState = { ...visibility };

      table.getAllLeafColumns().forEach((column) => {
        if (!column.getCanHide()) {
          return;
        }

        const columnId = column.id;

        if (Object.prototype.hasOwnProperty.call(visibility, columnId)) {
          nextVisibility[columnId] = visibility[columnId] ?? false;
          return;
        }

        nextVisibility[columnId] = false;
      });

      if (lockVisibleColumns.length === 0) {
        return nextVisibility;
      }

      lockVisibleColumns.forEach((columnId) => {
        if (table.getColumn(columnId)) {
          nextVisibility[columnId] = true;
        }
      });

      return nextVisibility;
    },
    [lockVisibleColumns, table],
  );

  React.useEffect(() => {
    if (!preferencesQuery.data || hasAppliedPreferences.current) {
      return;
    }

    const mergedVisibility = normalizeVisibility({
      ...table.getState().columnVisibility,
      ...preferencesQuery.data.preferences.visibility,
    });

    table.setColumnVisibility(mergedVisibility);
    hasAppliedPreferences.current = true;
    lastSavedVisibility.current = JSON.stringify(mergedVisibility);
    setIsReady(true);
  }, [normalizeVisibility, preferencesQuery.data, table]);

  const columnVisibility = table.getState().columnVisibility;
  const columnSignature = table
    .getAllLeafColumns()
    .map((column) => column.id)
    .join("|");

  React.useEffect(() => {
    if (!hasAppliedPreferences.current) {
      return;
    }

    const normalizedVisibility = normalizeVisibility(columnVisibility);
    const serialized = JSON.stringify(normalizedVisibility);

    if (serialized === lastSavedVisibility.current) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      lastSavedVisibility.current = serialized;
      saveTablePreferences(normalizedVisibility);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [columnVisibility, normalizeVisibility, saveTablePreferences]);

  React.useEffect(() => {
    if (!hasAppliedPreferences.current) {
      return;
    }

    const normalizedVisibility = normalizeVisibility(columnVisibility);
    const serialized = JSON.stringify(normalizedVisibility);

    if (serialized === JSON.stringify(columnVisibility)) {
      return;
    }

    lastSavedVisibility.current = serialized;
    table.setColumnVisibility(normalizedVisibility);
  }, [columnSignature, columnVisibility, normalizeVisibility, table]);

  React.useEffect(() => {
    if (!enabled || !organizationId) {
      setIsReady(true);
      return;
    }

    if (preferencesQuery.isError) {
      setIsReady(true);
    }
  }, [enabled, organizationId, preferencesQuery.isError]);

  React.useEffect(() => {
    hasAppliedPreferences.current = false;
    lastSavedVisibility.current = null;
    setIsReady(!enabled || !organizationId);
  }, [entityType, enabled, organizationId]);

  return { preferencesQuery, isReady };
}
