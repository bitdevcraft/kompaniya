"use client";

import type { OrgEmailTemplate } from "@repo/database/schema";

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

import type { RecordPageLayout } from "@/components/record-page/layout";

import { RecordLayoutRenderer } from "@/components/record-page/record-layout-renderer";
import { useLayout } from "@/components/record-page/use-layout";

import type { EmailTemplateRecordFormValues } from "../../email-template-record-schema";

import { modelEndpoint } from "../../config";
import {
  createEmailTemplateFormDefaults,
  createEmailTemplateUpdatePayload,
  emailTemplateRecordSchema,
} from "../../email-template-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgEmailTemplate;
  recordId: string;
}

const emailTemplateRecordQueryKey = (recordId: string) =>
  ["email-template-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_email_templates",
  ) as RecordPageLayout<EmailTemplateRecordFormValues>;

  const queryKey = useMemo(
    () => emailTemplateRecordQueryKey(recordId),
    [recordId],
  );

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchEmailTemplateRecord(recordId),
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
    () =>
      record ? createEmailTemplateFormDefaults(record, layout) : undefined,
    [layout, record],
  );

  const form = useForm<EmailTemplateRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(emailTemplateRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createEmailTemplateFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateEmailTemplate = useMutation({
    mutationFn: (payload: Partial<OrgEmailTemplate>) =>
      updateEmailTemplateRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createEmailTemplateFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Email template updated");
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

    const parsed = emailTemplateRecordSchema.parse(values);
    const payload = createEmailTemplateUpdatePayload(record, parsed, layout);

    try {
      await updateEmailTemplate.mutateAsync(payload);
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
        Unable to load this email template record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateEmailTemplate.isPending}
            onClick={() => {
              form.reset(createEmailTemplateFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateEmailTemplate.isPending} type="submit">
            {updateEmailTemplate.isPending ? (
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
            href="/marketing/email-templates"
          >
            <ArrowLeft className="size-4" />
            Back to email templates
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

async function fetchEmailTemplateRecord(recordId: string) {
  const { data } = await axios.get<OrgEmailTemplate>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateEmailTemplateRecord(
  recordId: string,
  payload: Partial<OrgEmailTemplate>,
) {
  const { data } = await axios.patch<OrgEmailTemplate>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
