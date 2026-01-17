"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { useEffect, useState } from "react";

import type { CustomComponentProps } from "@/lib/component-definitions";

import { env } from "@/env/client";

import {
  type ReferenceFieldDescriptor,
  RelatedRecordsSection,
} from "./related-records-section";

interface RelatedRecordsSingleConfig {
  title?: string;
  sourceEntityType?: string;
  perPage?: number;
  showEmpty?: boolean;
}

export function RelatedRecordsSingle({
  entityType,
  recordId,
  config,
}: CustomComponentProps) {
  const typedConfig = config as RelatedRecordsSingleConfig | undefined;
  const title =
    typeof typedConfig?.title === "string"
      ? typedConfig.title
      : "Related Records";
  const sourceEntityType =
    typeof typedConfig?.sourceEntityType === "string"
      ? typedConfig.sourceEntityType
      : "";
  const perPage =
    typeof typedConfig?.perPage === "number" && typedConfig.perPage > 0
      ? typedConfig.perPage
      : 10;
  const showEmpty =
    typeof typedConfig?.showEmpty === "boolean" ? typedConfig.showEmpty : true;

  const [descriptor, setDescriptor] = useState<ReferenceFieldDescriptor | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceEntityType) {
      setDescriptor(null);
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const loadReferences = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/references/discover?entityType=${encodeURIComponent(
            entityType,
          )}`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as ReferenceFieldDescriptor[];
        if (!isActive) return;

        const match =
          payload.find((item) => item.sourceEntityType === sourceEntityType) ??
          null;
        setDescriptor(match);
      } catch (caught) {
        if (!isActive) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "Failed to load related records",
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadReferences();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [entityType, sourceEntityType]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!sourceEntityType ? (
          <div className="text-sm text-muted-foreground">
            Select a source entity type in the component settings.
          </div>
        ) : null}
        {sourceEntityType && isLoading ? (
          <div className="text-sm text-muted-foreground">
            Loading related records...
          </div>
        ) : null}
        {sourceEntityType && !isLoading && error ? (
          <div className="text-sm text-destructive">
            Unable to load related records: {error}
          </div>
        ) : null}
        {sourceEntityType && !isLoading && !error && !descriptor ? (
          <div className="text-sm text-muted-foreground">
            No reference found for {sourceEntityType}.
          </div>
        ) : null}
        {descriptor ? (
          <RelatedRecordsSection
            collapsible={false}
            fieldName={descriptor.fieldName}
            fieldType={descriptor.fieldType}
            label={descriptor.label}
            perPage={perPage}
            showEmpty={showEmpty}
            sourceEntityType={descriptor.sourceEntityType}
            targetEntityType={entityType}
            targetRecordId={recordId}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
