"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import { RecordLayoutBuilder } from "@/components/record-layout-builder";
import { getEntityTypeConfig } from "@/lib/field-definitions";
import { fetchRecordLayout, updateRecordLayout } from "@/lib/record-layouts";

export default function EntityRecordLayoutPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const entityType = params.entityType as string;

  const entityConfig = getEntityTypeConfig(entityType);

  // Fetch current layout
  const { data: layout, isLoading } = useQuery({
    queryKey: ["record-layout", entityType],
    queryFn: () => fetchRecordLayout(entityType),
  });

  // Update layout mutation
  const mutation = useMutation({
    mutationFn: (layoutData: unknown) =>
      updateRecordLayout(entityType, layoutData as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["record-layout", entityType],
      });
    },
  });

  if (isLoading) {
    return <div className="p-4">Loading layout...</div>;
  }

  if (!entityConfig) {
    return <div className="p-4">Unknown entity type</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/settings/record-layouts")}
          type="button"
        >
          ← Back to Record Layouts
        </button>
      </div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{entityConfig.label} Layout</h1>
        <p className="text-muted-foreground">
          {entityConfig.description} — Customize the field layout and
          arrangement
        </p>
      </div>

      {layout && (
        <RecordLayoutBuilder
          entityType={entityType}
          initialLayout={layout}
          onSave={mutation.mutate}
        />
      )}
    </div>
  );
}
