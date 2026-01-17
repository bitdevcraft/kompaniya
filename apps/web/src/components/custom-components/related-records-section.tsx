"use client";

import { Button } from "@kompaniya/ui-common/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@kompaniya/ui-common/components/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kompaniya/ui-common/components/table";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatDateTime } from "@/components/record-page/utils";
import { env } from "@/env/client";

export interface ReferenceFieldDescriptor {
  sourceEntityType: string;
  fieldName: string;
  fieldType: "original" | "custom";
  label: string;
  apiPath: string;
  recordPath: string;
}

type RelatedRecord = Record<string, unknown> & { id?: string };

interface RelatedRecordsResponse<T = Record<string, unknown>> {
  entityType: string;
  entityLabel: string;
  fieldUsed: string;
  fieldLabel: string;
  apiPath: string;
  recordPath: string;
  data: T[];
  pageCount: number;
  totalCount: number;
}

interface RelatedRecordsSectionProps {
  sourceEntityType: string;
  targetEntityType: string;
  targetRecordId: string;
  fieldName: string;
  fieldType: "original" | "custom";
  label: string;
  perPage: number;
  defaultOpen?: boolean;
  showEmpty?: boolean;
  collapsible?: boolean;
}

export function RelatedRecordsSection({
  sourceEntityType,
  targetEntityType,
  targetRecordId,
  fieldName,
  fieldType,
  label,
  perPage,
  defaultOpen = true,
  showEmpty = true,
  collapsible = false,
}: RelatedRecordsSectionProps) {
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState<RelatedRecord[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [recordPath, setRecordPath] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [
    sourceEntityType,
    targetEntityType,
    targetRecordId,
    fieldName,
    fieldType,
  ]);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  useEffect(() => {
    if (collapsible && !isOpen) {
      return;
    }
    if (!targetRecordId || !fieldName) {
      return;
    }

    let isActive = true;
    const controller = new AbortController();

    const loadRelatedRecords = async () => {
      setIsLoading(true);
      setHasLoaded(false);
      setError(null);

      const params = new URLSearchParams({
        targetEntityType,
        targetRecordId,
        sourceEntityType,
        fieldName,
        fieldType,
        page: String(page),
        perPage: String(perPage),
      });

      try {
        const response = await fetch(
          `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/references/related?${params.toString()}`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as RelatedRecordsResponse;
        if (!isActive) return;

        setData((payload.data ?? []) as RelatedRecord[]);
        setPageCount(payload.pageCount ?? 0);
        setTotalCount(payload.totalCount ?? 0);
        setRecordPath(payload.recordPath ?? null);
        setHasLoaded(true);
      } catch (caught) {
        if (!isActive) return;
        setError(
          caught instanceof Error ? caught.message : "Failed to load records",
        );
        setHasLoaded(true);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadRelatedRecords();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [
    collapsible,
    fieldName,
    fieldType,
    isOpen,
    page,
    perPage,
    sourceEntityType,
    targetEntityType,
    targetRecordId,
  ]);

  const countLabel = useMemo(() => {
    if (!hasLoaded) return "...";
    return totalCount.toString();
  }, [hasLoaded, totalCount]);

  const content = (
    <div className="space-y-3">
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
      {!isLoading && !error && hasLoaded && data.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No related records for {label}.
        </div>
      ) : null}
      {!isLoading && !error && data.length > 0 ? (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Record</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record) => {
                  const id = record.id ? String(record.id) : "";
                  const title = resolveRecordLabel(record);
                  const url = buildRecordUrl(recordPath, id);
                  const timestamp = formatDateTime(
                    (record.updatedAt ?? record.createdAt) as
                      | string
                      | Date
                      | null,
                  );

                  return (
                    <TableRow key={id || title}>
                      <TableCell className="font-medium">
                        {url ? (
                          <Link
                            className="text-primary hover:underline"
                            href={url}
                          >
                            {title}
                          </Link>
                        ) : (
                          title
                        )}
                      </TableCell>
                      <TableCell>{timestamp ?? "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {data.length} of {totalCount}
            </span>
            {pageCount > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {pageCount}
                </span>
                <Button
                  disabled={page >= pageCount}
                  onClick={() =>
                    setPage((current) => Math.min(pageCount, current + 1))
                  }
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );

  if (!showEmpty && hasLoaded && totalCount === 0 && !error) {
    return null;
  }

  if (!collapsible) {
    return content;
  }

  return (
    <Collapsible
      className="rounded-lg border border-border/60"
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <CollapsibleTrigger className="group flex w-full items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{countLabel}</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="border-t px-4 py-3">
        {content}
      </CollapsibleContent>
    </Collapsible>
  );
}

function buildRecordUrl(recordPath: string | null, id: string): string | null {
  if (!recordPath || !id) return null;
  return `/record/${recordPath}/r/${encodeURIComponent(id)}`;
}

function resolveRecordLabel(record: RelatedRecord): string {
  const keys = ["name", "subject", "code", "referenceCode", "email", "link"];
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  if (record.id) {
    return String(record.id);
  }
  return "Untitled";
}
