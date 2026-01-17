"use client";

import type { OrgEmail } from "@repo/database/schema";

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

import type { EmailRecordFormValues } from "./emails-record-schema";

import { modelEndpoint } from "../../config";
import {
  createEmailFormDefaults,
  createEmailUpdatePayload,
  emailRecordSchema,
} from "./emails-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgEmail;

  recordId: string;
}

const emailRecordQueryKey = (recordId: string) =>
  ["email-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_emails",
  ) as RecordPageLayout<EmailRecordFormValues>;

  const queryKey = useMemo(() => emailRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchEmailRecord(recordId),
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
    () => (record ? createEmailFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<EmailRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(emailRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createEmailFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateEmail = useMutation({
    mutationFn: (payload: Partial<OrgEmail>) =>
      updateEmailRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createEmailFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Email updated");
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

    const parsed = emailRecordSchema.parse(values);
    const payload = createEmailUpdatePayload(record, parsed, layout);

    try {
      await updateEmail.mutateAsync(payload);
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
      <div className="text-destructive">Unable to load this email record.</div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateEmail.isPending}
            onClick={() => {
              form.reset(createEmailFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateEmail.isPending} type="submit">
            {updateEmail.isPending ? (
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
            href="/record/emails"
          >
            <ArrowLeft className="size-4" />
            Back to emails
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          entityType="org_emails"
          form={form}
          isEditing={isEditing}
          layout={layout}
          record={record as Record<string, unknown>}
          recordId={recordId}
        />
      </form>
    </div>
  );
}

async function fetchEmailRecord(recordId: string) {
  const { data } = await axios.get<OrgEmail>(`${modelEndpoint}/r/${recordId}`, {
    withCredentials: true,
  });

  return data;
}

async function updateEmailRecord(recordId: string, payload: Partial<OrgEmail>) {
  const { data } = await axios.patch<OrgEmail>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
