import axios from "axios";

import type { NativeFieldDefinition } from "@/lib/field-definitions";

import { env } from "@/env/client";

export interface RecordLayoutResponse {
  header: unknown;
  sectionColumns?: unknown;
  sections?: unknown[];
  supplementalFields?: unknown[];
  isDefault?: boolean;
  autoIncludeCustomFields?: boolean;
  isCustomized?: boolean;
}

/**
 * Fetch all record layouts for an organization
 */
export async function fetchAllRecordLayouts(
  organizationId: string,
): Promise<unknown[]> {
  try {
    const response = await fetch(
      `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/record-layouts`,
      {
        credentials: "include",
        headers: {
          "x-organization-id": organizationId,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch layouts: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching record layouts:", error);
    return [];
  }
}

/**
 * Fetch custom fields for layout builder
 * Returns custom fields in the format needed by the field palette
 */
export async function fetchCustomFieldsForBuilder(
  entityType: string,
): Promise<NativeFieldDefinition[]> {
  try {
    const response = await axios.get(
      `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/record-layouts/${entityType}/custom-fields`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch {
    // Return empty array if fetch fails
    return [];
  }
}

/**
 * Fetch layout for an entity type from API
 */
export async function fetchRecordLayout(
  entityType: string,
): Promise<RecordLayoutResponse | null> {
  try {
    const response = await axios.get(
      `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/record-layouts/${entityType}`,
      {
        withCredentials: true,
      },
    );

    if (!response.data) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch layout: ${response.statusText}`);
    }

    return await response.data;
  } catch (error) {
    console.error("Error fetching record layout:", error);
    return null;
  }
}

/**
 * Reset layout to default
 */
export async function resetRecordLayout(
  entityType: string,
): Promise<{ success: boolean }> {
  const response = await axios.delete(
    `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/record-layouts/${entityType}`,
    {
      withCredentials: true,
    },
  );

  if (!response.data) {
    throw new Error(`Failed to reset layout: ${response.statusText}`);
  }

  return await response.data;
}

/**
 * Update record layout
 */
export async function updateRecordLayout(
  entityType: string,
  layout: Record<string, unknown>,
): Promise<RecordLayoutResponse> {
  const response = await axios.post(
    `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/record-layouts/${entityType}`,
    layout,
    {
      withCredentials: true,
    },
  );

  if (!response.data) {
    throw new Error(`Failed to update layout: ${response.statusText}`);
  }

  return await response.data;
}
