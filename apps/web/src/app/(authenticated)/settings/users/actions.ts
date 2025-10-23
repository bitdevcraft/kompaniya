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
