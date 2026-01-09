"use client";

import type { Option } from "@kompaniya/ui-data-table/types/data-table";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { env } from "@/env/client";

const TAGS_ENDPOINT = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/tag`;

export function useTagOptions(relatedType?: string) {
  return useQuery({
    queryKey: ["tag-options", relatedType],
    enabled: Boolean(relatedType),
    queryFn: async () => {
      try {
        const response = await axios.get(TAGS_ENDPOINT, {
          params: { relatedType },
          withCredentials: true,
        });
        return normalizeTagOptions(response.data);
      } catch {
        return [];
      }
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTagOptions(data: unknown): Option[] {
  const records = toRecordArray(data);

  return records
    .map((record) => {
      const rawName = record.name;
      if (rawName === null || rawName === undefined) return null;
      const name = String(rawName).trim();
      if (!name) return null;
      return { label: name, value: name };
    })
    .filter((option): option is Option => Boolean(option));
}

function toRecordArray(data: unknown): Record<string, unknown>[] {
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
}
