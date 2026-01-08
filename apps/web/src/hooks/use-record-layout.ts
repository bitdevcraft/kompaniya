import { useQuery } from "@tanstack/react-query";

import { authClient } from "@/lib/auth/client";
import {
  fetchRecordLayout,
  type RecordLayoutResponse,
} from "@/lib/record-layouts";

/**
 * React Query hook for fetching all record layouts
 */
export function useAllRecordLayouts() {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  return useQuery({
    queryKey: ["record-layouts", activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization?.id) {
        throw new Error("No active organization");
      }
      const { fetchAllRecordLayouts } = await import("@/lib/record-layouts");
      return fetchAllRecordLayouts(activeOrganization.id);
    },
    enabled: !!activeOrganization?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * React Query hook for fetching a record layout
 */
export function useRecordLayout(entityType: string) {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  return useQuery({
    queryKey: ["record-layout", activeOrganization?.id, entityType],
    queryFn: () => {
      if (!activeOrganization?.id) {
        throw new Error("No active organization");
      }
      return fetchRecordLayout(entityType);
    },
    enabled: !!activeOrganization?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export type { RecordLayoutResponse };
