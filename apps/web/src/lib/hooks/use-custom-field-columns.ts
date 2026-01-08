"use client";

import type { ColumnDef } from "@tanstack/react-table";

import {
  type CustomFieldDefinition,
  generateCustomFieldColumns,
  type TableRowWithCustomFields,
} from "@kompaniya/ui-data-table/lib/custom-field-columns";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { env } from "@/env/client";

/**
 * Hook to fetch custom field definitions and generate table columns
 *
 * @param entityType - The entity type to fetch custom fields for (e.g., "org_contacts")
 * @param options - Optional configuration
 * @returns Array of column definitions or undefined while loading
 *
 * @example
 * ```tsx
 * const customFieldColumns = useCustomFieldColumns('org_contacts');
 *
 * if (customFieldColumns === undefined) {
 *   return <div>Loading...</div>;
 * }
 *
 * return <DataTable columns={[...staticColumns, ...customFieldColumns]} />
 * ```
 */
export function useCustomFieldColumns<
  T extends TableRowWithCustomFields = TableRowWithCustomFields,
>(
  entityType: string,
  options?: {
    /**
     * Whether to enable the query
     * @default true
     */
    enabled?: boolean;
    /**
     * Stale time in milliseconds
     * @default 60000 (1 minute)
     */
    staleTime?: number;
  },
): ColumnDef<T>[] | undefined {
  const { enabled = true, staleTime = 60000 } = options ?? {};

  const { data, isLoading } = useQuery({
    queryKey: ["custom-field-definitions", entityType],
    queryFn: () => fetchCustomFieldDefinitions(entityType),
    enabled,
    staleTime,
  });

  // Return undefined while loading to allow graceful degradation
  if (isLoading || !data) {
    return undefined;
  }

  // Generate columns using the helper function
  return generateCustomFieldColumns<T>(data);
}

/**
 * Hook to fetch custom field definitions without generating columns
 * Useful when you need access to the raw definitions
 */
export function useCustomFieldDefinitions(
  entityType: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  },
): CustomFieldDefinition[] | undefined {
  const { enabled = true, staleTime = 60000 } = options ?? {};

  const { data, isLoading } = useQuery({
    queryKey: ["custom-field-definitions", entityType],
    queryFn: () => fetchCustomFieldDefinitions(entityType),
    enabled,
    staleTime,
  });

  if (isLoading || !data) {
    return undefined;
  }

  return data;
}

/**
 * Fetch custom field definitions for an entity type
 */
async function fetchCustomFieldDefinitions(
  entityType: string,
): Promise<CustomFieldDefinition[]> {
  try {
    const response = await axios.get<CustomFieldDefinition[]>(
      `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/custom-fields/definitions`,
      {
        params: { entityType },
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching custom field definitions:", error);
    return [];
  }
}
