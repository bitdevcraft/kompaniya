"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

export async function fetchUsers(
  organizationId: string,
  page: number,
  pageSize: number,
) {
  const { data } = await authClient.organization.listMembers({
    query: {
      organizationId,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    },
  });

  return data;
}

export function useDeactivateUser() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await axios.put(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/system-admin/deactivate-user/${id}`,
        {},
        {
          withCredentials: true,
        },
      );

      return response.data;
    },
  });
}
