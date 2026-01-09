"use client";

import type { OrgEmailCampaign } from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kompaniya/ui-common/components/dialog";
import { HtmlLivePreview } from "@kompaniya/ui-monaco-editor/components/html-live-preview";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { RecordLayoutRenderer } from "@/components/record-page/record-layout-renderer";

import type { EmailCampaignRecordFormValues } from "../../email-campaign-record-schema";

import { modelEndpoint } from "../../config";
import { emailCampaignRecordLayout } from "../../email-campaign-record-layout";
import {
  createEmailCampaignFormDefaults,
  createEmailCampaignUpdatePayload,
  emailCampaignRecordSchema,
} from "../../email-campaign-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgEmailCampaign;

  recordId: string;
}

const PREVIEW_STYLES = `body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 1.5rem;
  background-color: #ffffff;
  color: #0f172a;
}`;

const emailCampaignRecordQueryKey = (recordId: string) =>
  ["email-campaign-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => emailCampaignRecordQueryKey(recordId),
    [recordId],
  );

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchEmailCampaignRecord(recordId),
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
      record
        ? createEmailCampaignFormDefaults(record, emailCampaignRecordLayout)
        : undefined,
    [record],
  );

  const form = useForm<EmailCampaignRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(emailCampaignRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(
        createEmailCampaignFormDefaults(record, emailCampaignRecordLayout),
      );
    }
  }, [form, record]);

  const watchedHtml = useWatch({ control: form.control, name: "htmlContent" });
  const previewHtml =
    typeof watchedHtml === "string" && watchedHtml.trim().length > 0
      ? watchedHtml
      : (record?.htmlContent ?? record?.body ?? "");
  const hasPreview =
    typeof previewHtml === "string" && previewHtml.trim().length > 0;

  const updateEmailCampaign = useMutation({
    mutationFn: (payload: Partial<OrgEmailCampaign>) =>
      updateEmailCampaignRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(
        createEmailCampaignFormDefaults(updated, emailCampaignRecordLayout),
      );
      setIsEditing(false);
      toast.success("Email campaign updated");
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

    const parsed = emailCampaignRecordSchema.parse(values);
    const payload = createEmailCampaignUpdatePayload(
      record,
      parsed,
      emailCampaignRecordLayout,
    );

    try {
      await updateEmailCampaign.mutateAsync(payload);
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
        Unable to load this email campaign record.
      </div>
    );
  }

  const previewButton = (
    <Dialog onOpenChange={setIsPreviewOpen} open={isPreviewOpen}>
      <DialogTrigger asChild>
        <Button disabled={!hasPreview} type="button" variant="outline">
          <Eye className="size-4" />
          Email preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Email preview</DialogTitle>
          <DialogDescription>
            Preview the HTML that will be sent with this campaign.
          </DialogDescription>
        </DialogHeader>
        {hasPreview ? (
          <HtmlLivePreview
            className="min-h-[60vh]"
            frameClassName="min-h-[60vh]"
            header="Campaign email"
            html={String(previewHtml)}
            previewStyles={PREVIEW_STYLES}
          />
        ) : (
          <div className="rounded-md border bg-muted/30 p-6 text-sm text-muted-foreground">
            No HTML content is available for this campaign yet.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          {previewButton}
          <Button
            disabled={updateEmailCampaign.isPending}
            onClick={() => {
              form.reset(
                createEmailCampaignFormDefaults(
                  record,
                  emailCampaignRecordLayout,
                ),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateEmailCampaign.isPending} type="submit">
            {updateEmailCampaign.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Save changes
          </Button>
        </>
      ) : (
        <>
          {previewButton}
          <Button onClick={() => setIsEditing(true)} type="button">
            Edit record
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost">
          <Link
            className="inline-flex items-center gap-2"
            href="/record/email-campaigns"
          >
            <ArrowLeft className="size-4" />
            Back to email campaigns
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={emailCampaignRecordLayout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
  );
}

async function fetchEmailCampaignRecord(recordId: string) {
  const { data } = await axios.get<OrgEmailCampaign>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateEmailCampaignRecord(
  recordId: string,
  payload: Partial<OrgEmailCampaign>,
) {
  const { data } = await axios.patch<OrgEmailCampaign>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
