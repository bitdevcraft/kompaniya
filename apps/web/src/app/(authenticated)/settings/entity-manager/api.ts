import axios from "axios";

import { env } from "@/env/client";

export interface EntityMetadata {
  entityType: string;
  customFieldsCount: number;
  layoutModifiedAt: string | null;
  isDefaultLayout: boolean;
}

/**
 * Fetch metadata for all entities
 */
export async function fetchEntitiesMetadata(): Promise<
  Record<string, EntityMetadata>
> {
  try {
    const response = await axios.get<Record<string, EntityMetadata>>(
      `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/entities/metadata`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch {
    return {};
  }
}
