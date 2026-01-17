"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

import type { CustomComponentProps } from "@/lib/component-definitions";

import { env } from "@/env/client";

import {
  type ReferenceFieldDescriptor,
  RelatedRecordsSection,
} from "./related-records-section";

interface RelatedRecordsMultiConfig {
  title?: string;
  perPage?: number;
  defaultExpanded?: string[];
  showEmptySections?: boolean;
}

export function RelatedRecordsMulti({
  entityType,
  recordId,
  config,
}: CustomComponentProps) {
  const typedConfig = config as RelatedRecordsMultiConfig | undefined;
  const title =
    typeof typedConfig?.title === "string"
      ? typedConfig.title
      : "Related Records";
  const perPage =
    typeof typedConfig?.perPage === "number" && typedConfig.perPage > 0
      ? typedConfig.perPage
      : 5;
  const showEmptySections =
    typeof typedConfig?.showEmptySections === "boolean"
      ? typedConfig.showEmptySections
      : false;

  const [sections, setSections] = useState<ReferenceFieldDescriptor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultExpandedSet = useMemo(
    () =>
      new Set(
        Array.isArray(typedConfig?.defaultExpanded)
          ? typedConfig.defaultExpanded
          : [],
      ),
    [typedConfig?.defaultExpanded],
  );

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadReferences = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get<ReferenceFieldDescriptor[]>(
          `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/references/discover?entityType=${encodeURIComponent(entityType)}`,
          {
            withCredentials: true,
            signal: controller.signal,
          },
        );

        const payload = response.data;
        if (!isActive) return;

        const sorted = [...payload].sort((a, b) =>
          a.label.localeCompare(b.label),
        );
        setSections(sorted);
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
  }, [entityType]);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">
            Loading related records...
          </div>
        ) : null}
        {!isLoading && error ? (
          <div className="text-sm text-destructive">
            Unable to load related records: {error}
          </div>
        ) : null}
        {!isLoading && !error && sections.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No related records for this entity.
          </div>
        ) : null}
        {!isLoading && !error && sections.length > 0 ? (
          <div className="space-y-3">
            {sections.map((section) => (
              <RelatedRecordsSection
                collapsible
                defaultOpen={defaultExpandedSet.has(section.sourceEntityType)}
                fieldName={section.fieldName}
                fieldType={section.fieldType}
                key={`${section.sourceEntityType}-${section.fieldType}-${section.fieldName}`}
                label={section.label}
                perPage={perPage}
                showEmpty={showEmptySections}
                sourceEntityType={section.sourceEntityType}
                targetEntityType={entityType}
                targetRecordId={recordId}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
