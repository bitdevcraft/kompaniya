"use client";

import type { OrgEmailDomain } from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import { toast } from "sonner";

import { type RecordPageLayout } from "@/components/record-page/layout";
import { RecordLayoutRenderer } from "@/components/record-page/record-layout-renderer";
import { useLayout } from "@/components/record-page/use-layout";

import type { EmailDomainRecordFormValues } from "./email-domains-record-schema";

import { modelEndpoint } from "../../config";
import {
  createEmailDomainFormDefaults,
  createEmailDomainUpdatePayload,
  emailDomainRecordSchema,
} from "./email-domains-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgEmailDomain;

  recordId: string;
}

const emailDomainRecordQueryKey = (recordId: string) =>
  ["email-domain-record", recordId] as const;

type DnsRecord = {
  type: string;
  name: string;
  value: string;
  priority?: number;
};

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_email_domains",
  ) as RecordPageLayout<EmailDomainRecordFormValues>;

  const queryKey = useMemo(
    () => emailDomainRecordQueryKey(recordId),
    [recordId],
  );

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchEmailDomainRecord(recordId),
    initialData: initialRecord,
    retry: false,
  });

  useEffect(() => {
    const isNotFoundError =
      !isLoading &&
      axios.isAxiosError(error) &&
      error?.response?.status === 404;

    if (isNotFoundError) {
      router.replace("/404");
    }
  }, [error, isLoading, router]);

  const resolvedLayout = useMemo(
    () =>
      record?.status === "READY"
        ? hideSection(layout, "domain-verification")
        : layout,
    [layout, record?.status],
  );

  const formDefaults = useMemo(
    () =>
      record
        ? createEmailDomainFormDefaults(record, resolvedLayout)
        : undefined,
    [record, resolvedLayout],
  );

  const form = useForm<EmailDomainRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(emailDomainRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createEmailDomainFormDefaults(record, resolvedLayout));
    }
  }, [form, record, resolvedLayout]);

  const updateEmailDomain = useMutation({
    mutationFn: (payload: Partial<OrgEmailDomain>) =>
      updateEmailDomainRecord(recordId, payload),
    onSuccess: (updated) => {
      const updatedLayout =
        updated.status === "READY"
          ? hideSection(layout, "domain-verification")
          : layout;
      queryClient.setQueryData(queryKey, updated);
      form.reset(createEmailDomainFormDefaults(updated, updatedLayout));
      setIsEditing(false);
      toast.success("Email domain updated");
    },
    onError: () => {
      toast.error("We couldn't save your changes. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!record) return;

    const parsed = emailDomainRecordSchema.parse(values);
    const payload = createEmailDomainUpdatePayload(
      record,
      parsed,
      resolvedLayout,
    );

    try {
      await updateEmailDomain.mutateAsync(payload);
    } catch (_error) {
      // handled by mutation onError
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="text-destructive">
        Unable to load this email domain record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateEmailDomain.isPending}
            onClick={() => {
              form.reset(createEmailDomainFormDefaults(record, resolvedLayout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateEmailDomain.isPending} type="submit">
            {updateEmailDomain.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save changes
          </Button>
        </>
      ) : (
        <Button onClick={() => setIsEditing(true)} type="button">
          Edit record
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link
            className="inline-flex items-center gap-2"
            href="/record/email-domains"
          >
            <ArrowLeft className="size-4" />
            Back to email domains
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          entityType="org_email_domains"
          form={form}
          isEditing={isEditing}
          layout={resolvedLayout}
          record={record as Record<string, unknown>}
          recordId={recordId}
        />
        {record.status === "PENDING" ? (
          <DnsRecordsSection record={record as Record<string, unknown>} />
        ) : null}
      </form>
    </div>
  );
}

function DnsRecordsSection({ record }: { record: Record<string, unknown> }) {
  const dnsRecords = getDnsRecords(record.dnsRecords);

  return (
    <Card className="border-border/60">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg">DNS records</CardTitle>
        <CardDescription>
          Add these DNS records in your domain provider. AWS SES uses them to
          verify the domain and confirm ownership.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dnsRecords.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground">
            DNS records are not available yet. Please refresh in a few minutes.
          </div>
        ) : (
          <div className="grid gap-3">
            {dnsRecords.map((dnsRecord, index) => (
              <div
                className="grid gap-3 rounded-md border border-border/60 p-3 text-sm md:grid-cols-[90px_1fr_1fr]"
                key={`${dnsRecord.type}-${dnsRecord.name}-${index}`}
              >
                <div className="font-medium text-muted-foreground">
                  {dnsRecord.type}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Name</div>
                  <div className="break-all font-mono text-sm">
                    {dnsRecord.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Value</div>
                  <div className="break-all font-mono text-sm">
                    {dnsRecord.value}
                  </div>
                  {typeof dnsRecord.priority === "number" ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Priority: {dnsRecord.priority}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function fetchEmailDomainRecord(recordId: string) {
  const { data } = await axios.get<OrgEmailDomain>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

function getDnsRecords(raw: unknown): DnsRecord[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry): DnsRecord | null => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }
      const record = entry as {
        type?: unknown;
        name?: unknown;
        value?: unknown;
        priority?: unknown;
      };

      if (
        typeof record.type !== "string" ||
        typeof record.name !== "string" ||
        typeof record.value !== "string"
      ) {
        return null;
      }

      const priority =
        typeof record.priority === "number" ? record.priority : undefined;

      return {
        type: record.type,
        name: record.name,
        value: record.value,
        ...(priority !== undefined ? { priority } : {}),
      };
    })
    .filter((entry): entry is DnsRecord => entry !== null);
}

function hideSection<TFieldValues extends FieldValues>(
  layout: RecordPageLayout<TFieldValues>,
  sectionId: string,
): RecordPageLayout<TFieldValues> {
  const filterSections = (
    sections: NonNullable<RecordPageLayout<TFieldValues>["sections"]>,
  ) => sections.filter((section) => section.id !== sectionId);

  if (!layout.sectionColumns && !layout.sections) {
    return layout;
  }

  return {
    ...layout,
    sections: layout.sections
      ? filterSections(layout.sections)
      : layout.sections,
    sectionColumns: layout.sectionColumns
      ? {
          ...layout.sectionColumns,
          header: layout.sectionColumns.header
            ? {
                ...layout.sectionColumns.header,
                sections: filterSections(layout.sectionColumns.header.sections),
              }
            : layout.sectionColumns.header,
          firstColumn: layout.sectionColumns.firstColumn
            ? {
                ...layout.sectionColumns.firstColumn,
                sections: filterSections(
                  layout.sectionColumns.firstColumn.sections,
                ),
              }
            : layout.sectionColumns.firstColumn,
          secondColumn: layout.sectionColumns.secondColumn
            ? {
                ...layout.sectionColumns.secondColumn,
                sections: filterSections(
                  layout.sectionColumns.secondColumn.sections,
                ),
              }
            : layout.sectionColumns.secondColumn,
        }
      : layout.sectionColumns,
  };
}

async function updateEmailDomainRecord(
  recordId: string,
  payload: Partial<OrgEmailDomain>,
) {
  const { data } = await axios.patch<OrgEmailDomain>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
