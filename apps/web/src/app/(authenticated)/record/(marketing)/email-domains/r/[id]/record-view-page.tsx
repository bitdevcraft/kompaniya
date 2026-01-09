"use client";

import type { OrgEmailDomain } from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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

  const formDefaults = useMemo(
    () => (record ? createEmailDomainFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<EmailDomainRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(emailDomainRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createEmailDomainFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateEmailDomain = useMutation({
    mutationFn: (payload: Partial<OrgEmailDomain>) =>
      updateEmailDomainRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createEmailDomainFormDefaults(updated, layout));
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
    const payload = createEmailDomainUpdatePayload(record, parsed, layout);

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
              form.reset(createEmailDomainFormDefaults(record, layout));
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
          form={form}
          isEditing={isEditing}
          layout={layout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
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
