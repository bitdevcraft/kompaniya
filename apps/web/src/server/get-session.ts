"use server";

import { headers } from "next/headers";

import { authClient } from "@/lib/auth/client";

export const getUser = async () => {
  try {
    const headerList = await headers();
    const session = await authClient.getSession({
      fetchOptions: {
        headers: Object.fromEntries(headerList.entries()),
      },
    });
    return session.data;
  } catch (_error) {
    return null;
  }
};
