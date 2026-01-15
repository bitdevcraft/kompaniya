"use client";

import type {
  OrgEmailCampaign,
  OrgEmailTestReceiver,
} from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { AsyncSelect } from "@kompaniya/ui-common/components/async-select";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kompaniya/ui-common/components/dialog";
import { ConfirmDialog } from "@kompaniya/ui-common/components/dialog-confirm";
import { Input } from "@kompaniya/ui-common/components/input";
import { Textarea } from "@kompaniya/ui-common/components/textarea";
import { HtmlLivePreview } from "@kompaniya/ui-monaco-editor/components/html-live-preview";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { toDateTimeInputValue } from "@/components/record-page/layout-helpers";
import { RecordLayoutRenderer } from "@/components/record-page/record-layout-renderer";
import { env } from "@/env/client";

import type { EmailCampaignRecordFormValues } from "../../email-campaign-record-schema";

import { modelEndpoint } from "../../config";
import { emailCampaignRecordLayout } from "../../email-campaign-record-layout";
import {
  createEmailCampaignFormDefaults,
  createEmailCampaignUpdatePayload,
  emailCampaignRecordSchema,
} from "../../email-campaign-record-schema";

type PreviewRecipientsResponse = {
  count: number;
  sample: Array<{
    id?: string | null;
    name?: string | null;
    email?: string | null;
  }>;
};

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

const EMAIL_TEST_RECEIVER_ENDPOINT = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/email-test-receiver`;

const normalizeStringArray = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string");
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value
      .split(/\n|,/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [] as string[];
};

const buildPreviewRecipientsUrl = (
  endpoint: string,
  filters: {
    tagMatchType?: string;
    targetTags?: string[] | string;
    targetCategories?: string[] | string;
  },
) => {
  const url = new URL(buildUrl(endpoint));
  const normalizedTags = normalizeStringArray(filters.targetTags);
  const normalizedCategories = normalizeStringArray(filters.targetCategories);

  if (filters.tagMatchType) {
    url.searchParams.set("tagMatchType", filters.tagMatchType);
  }

  normalizedTags.forEach((tag) => {
    if (tag) {
      url.searchParams.append("targetTags[]", tag);
    }
  });

  normalizedCategories.forEach((category) => {
    if (category) {
      url.searchParams.append("targetCategories[]", category);
    }
  });

  return url.toString();
};

const parseEmailList = (input: string) =>
  input
    .split(/[\n,;\s]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value?: string) =>
  typeof value === "string" && UUID_REGEX.test(value);

const buildUrl = (endpoint: string) => {
  if (typeof window === "undefined") return endpoint;
  try {
    return new URL(endpoint, window.location.origin).toString();
  } catch {
    return endpoint;
  }
};

const normalizeEndpoint = (endpoint: string) => endpoint.replace(/\/$/, "");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toRecordArray = <T,>(data: unknown): T[] => {
  if (Array.isArray(data)) {
    return data.filter((entry): entry is T => isRecord(entry));
  }
  if (isRecord(data)) {
    if (Array.isArray(data.data)) {
      return data.data.filter((entry): entry is T => isRecord(entry));
    }
    if (isRecord(data.data)) {
      return [data.data as T];
    }
    return [data as T];
  }
  return [];
};

const fetchTestReceivers = async (
  query?: string,
): Promise<OrgEmailTestReceiver[]> => {
  const base = normalizeEndpoint(buildUrl(EMAIL_TEST_RECEIVER_ENDPOINT));
  const trimmed = query?.trim();

  if (trimmed && isUuid(trimmed)) {
    const response = await axios.get(`${base}/r/${trimmed}`, {
      withCredentials: true,
    });
    return toRecordArray<OrgEmailTestReceiver>(response.data);
  }

  const url = new URL(`${base}/paginated`);
  if (trimmed) {
    url.searchParams.set("name", trimmed);
  }
  const response = await axios.get(url.toString(), { withCredentials: true });
  return toRecordArray<OrgEmailTestReceiver>(response.data);
};

const fetchTestReceiverById = async (
  id: string,
): Promise<OrgEmailTestReceiver | null> => {
  if (!id) return null;
  const base = normalizeEndpoint(buildUrl(EMAIL_TEST_RECEIVER_ENDPOINT));
  const response = await axios.get(`${base}/r/${id}`, {
    withCredentials: true,
  });
  const [record] = toRecordArray<OrgEmailTestReceiver>(response.data);
  return record ?? null;
};

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleValue, setScheduleValue] = useState("");
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testEmails, setTestEmails] = useState("");
  const [testReceiverId, setTestReceiverId] = useState("");
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [previewRecipients, setPreviewRecipients] =
    useState<PreviewRecipientsResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => emailCampaignRecordQueryKey(recordId),
    [recordId],
  );
  const previewRecipientsEndpoint = `${modelEndpoint}/preview-recipients`;

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

  useEffect(() => {
    if (record?.orgEmailTestReceiverId) {
      setTestReceiverId(record.orgEmailTestReceiverId);
    }
  }, [record?.orgEmailTestReceiverId]);

  useEffect(() => {
    if (isScheduleOpen) {
      setScheduleValue(toDateTimeInputValue(record?.scheduledFor ?? ""));
    }
  }, [isScheduleOpen, record?.scheduledFor]);

  useEffect(() => {
    if (record?.status && record.status.toUpperCase() !== "DRAFT") {
      setIsEditing(false);
    }
  }, [record?.status]);

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

  const refreshRecord = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const sendCampaign = useMutation({
    mutationFn: async () =>
      axios.post(
        `${modelEndpoint}/r/${recordId}/send`,
        {},
        { withCredentials: true },
      ),
    onSuccess: () => {
      toast.success("Campaign sending started");
    },
    onError: () => {
      toast.error("We couldn't start sending this campaign.");
    },
    onSettled: refreshRecord,
  });

  const scheduleCampaign = useMutation({
    mutationFn: async (scheduledFor: string) =>
      axios.post(
        `${modelEndpoint}/r/${recordId}/schedule`,
        { scheduledFor },
        { withCredentials: true },
      ),
    onSuccess: () => {
      toast.success("Campaign scheduled");
      setIsScheduleOpen(false);
    },
    onError: () => {
      toast.error("We couldn't schedule this campaign.");
    },
    onSettled: refreshRecord,
  });

  const pauseCampaign = useMutation({
    mutationFn: async () =>
      axios.post(
        `${modelEndpoint}/r/${recordId}/pause`,
        {},
        { withCredentials: true },
      ),
    onSuccess: () => {
      toast.success("Campaign paused");
    },
    onError: () => {
      toast.error("We couldn't pause this campaign.");
    },
    onSettled: refreshRecord,
  });

  const resumeCampaign = useMutation({
    mutationFn: async () =>
      axios.post(
        `${modelEndpoint}/r/${recordId}/resume`,
        {},
        { withCredentials: true },
      ),
    onSuccess: () => {
      toast.success("Campaign resumed");
    },
    onError: () => {
      toast.error("We couldn't resume this campaign.");
    },
    onSettled: refreshRecord,
  });

  const cancelCampaign = useMutation({
    mutationFn: async () =>
      axios.post(
        `${modelEndpoint}/r/${recordId}/cancel`,
        {},
        { withCredentials: true },
      ),
    onSuccess: () => {
      toast.success("Campaign cancelled");
      setIsCancelOpen(false);
    },
    onError: () => {
      toast.error("We couldn't cancel this campaign.");
    },
    onSettled: refreshRecord,
  });

  const sendTestEmail = useMutation({
    mutationFn: async (payload: {
      emailAddresses: string[];
      testReceiverIds?: string[];
    }) =>
      axios.post(`${modelEndpoint}/r/${recordId}/test`, payload, {
        withCredentials: true,
      }),
    onSuccess: (_response, variables) => {
      toast.success(`Sent ${variables.emailAddresses.length} test emails`);
      setIsTestOpen(false);
      setTestEmails("");
    },
    onError: () => {
      toast.error("We couldn't send the test email.");
    },
    onSettled: refreshRecord,
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

  const handleSchedule = async () => {
    const trimmed = scheduleValue.trim();
    if (!trimmed) {
      toast.error("Choose a schedule time first.");
      return;
    }

    const scheduledFor = new Date(trimmed);
    if (Number.isNaN(scheduledFor.getTime())) {
      toast.error("Schedule time is invalid.");
      return;
    }

    if (scheduledFor.getTime() <= Date.now()) {
      toast.error("Schedule time must be in the future.");
      return;
    }

    try {
      await scheduleCampaign.mutateAsync(scheduledFor.toISOString());
    } catch (_error) {
      // handled by mutation onError
    }
  };

  const handleSendTest = async () => {
    const directEmails = parseEmailList(testEmails);
    let receiverEmails: string[] = [];

    if (testReceiverId) {
      try {
        const receiver = await fetchTestReceiverById(testReceiverId);
        receiverEmails = receiver?.emails ?? [];
      } catch (_error) {
        receiverEmails = [];
      }
    }

    const emailAddresses = Array.from(
      new Set([...directEmails, ...receiverEmails]),
    ).filter((entry) => entry.length > 0);

    if (emailAddresses.length === 0) {
      toast.error("Add at least one test email address.");
      return;
    }

    try {
      await sendTestEmail.mutateAsync({
        emailAddresses,
        testReceiverIds: testReceiverId ? [testReceiverId] : undefined,
      });
    } catch (_error) {
      // handled by mutation onError
    }
  };

  const handlePreviewRecipients = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    setPreviewRecipients(null);

    try {
      const values = form.getValues();
      const url = buildPreviewRecipientsUrl(previewRecipientsEndpoint, {
        tagMatchType: values.tagMatchType,
        targetTags: values.targetTags ?? [],
        targetCategories: values.targetCategories ?? [],
      });
      const response = await axios.get<PreviewRecipientsResponse>(url, {
        withCredentials: true,
      });
      setPreviewRecipients(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setPreviewError(
          error.response?.data?.message ||
            error.message ||
            "Unable to preview recipients.",
        );
      } else {
        setPreviewError("Unable to preview recipients.");
      }
    } finally {
      setPreviewLoading(false);
    }
  };

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

  const status = (record.status ?? "DRAFT").toUpperCase();
  const canEdit = status === "DRAFT";
  const canSend = status === "DRAFT";
  const canSchedule = status === "DRAFT";
  const canPause = status === "SENDING";
  const canResume = status === "PAUSED";
  const canCancel = ["PAUSED", "SCHEDULED", "SENDING"].includes(status);
  const canTest = status === "DRAFT" || status === "PAUSED";

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

  const scheduleDialog = (
    <Dialog onOpenChange={setIsScheduleOpen} open={isScheduleOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canSchedule} type="button" variant="outline">
          Schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule campaign</DialogTitle>
          <DialogDescription>
            Pick a future time to start this campaign.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Input
            onChange={(event) => setScheduleValue(event.target.value)}
            type="datetime-local"
            value={scheduleValue}
          />
          <p className="text-sm text-muted-foreground">
            Scheduled campaigns are read-only until cancelled.
          </p>
        </div>
        <DialogFooter>
          <Button
            onClick={() => setIsScheduleOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={scheduleCampaign.isPending}
            onClick={handleSchedule}
            type="button"
          >
            {scheduleCampaign.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const testDialog = (
    <Dialog onOpenChange={setIsTestOpen} open={isTestOpen}>
      <DialogTrigger asChild>
        <Button disabled={!canTest} type="button" variant="outline">
          Send test
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send a test email</DialogTitle>
          <DialogDescription>
            Test sends do not affect warm-up limits.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Test receiver list</label>
            <AsyncSelect<OrgEmailTestReceiver>
              fetcher={(query) => fetchTestReceivers(query)}
              getDisplayValue={(option) => option.name ?? option.id}
              getOptionValue={(option) => option.id}
              label="test receiver"
              onChange={(value) => setTestReceiverId(value || "")}
              placeholder="Select a test recipient list"
              renderOption={(option) => (
                <div className="flex flex-col">
                  <span>{option.name ?? option.id}</span>
                  {option.emails?.length ? (
                    <span className="text-xs text-muted-foreground">
                      {option.emails.join(", ")}
                    </span>
                  ) : null}
                </div>
              )}
              triggerClassName="w-full justify-between"
              value={testReceiverId}
              width="100%"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email addresses</label>
            <Textarea
              onChange={(event) => setTestEmails(event.target.value)}
              placeholder="name@example.com, second@example.com"
              rows={3}
              value={testEmails}
            />
            <p className="text-sm text-muted-foreground">
              Add one or more addresses, separated by commas or new lines.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() => setIsTestOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={sendTestEmail.isPending}
            onClick={handleSendTest}
            type="button"
          >
            {sendTestEmail.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Send test
          </Button>
        </DialogFooter>
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
          {testDialog}
          <Button
            disabled={!canSend || sendCampaign.isPending}
            onClick={() => sendCampaign.mutate()}
            type="button"
          >
            {sendCampaign.isPending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : null}
            Send now
          </Button>
          {scheduleDialog}
          {canPause ? (
            <Button
              disabled={pauseCampaign.isPending}
              onClick={() => pauseCampaign.mutate()}
              type="button"
              variant="outline"
            >
              {pauseCampaign.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Pause
            </Button>
          ) : null}
          {canResume ? (
            <Button
              disabled={resumeCampaign.isPending}
              onClick={() => resumeCampaign.mutate()}
              type="button"
              variant="outline"
            >
              {resumeCampaign.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Resume
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              onClick={() => setIsCancelOpen(true)}
              type="button"
              variant="destructive"
            >
              Cancel campaign
            </Button>
          ) : null}
          <Button
            disabled={!canEdit}
            onClick={() => setIsEditing(true)}
            type="button"
            variant={canEdit ? "default" : "outline"}
          >
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
        <Card className="border-border/60">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Audience preview</CardTitle>
            <Button
              disabled={previewLoading}
              onClick={handlePreviewRecipients}
              type="button"
              variant="outline"
            >
              {previewLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Preview recipients
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {previewError ? (
              <p className="text-destructive">{previewError}</p>
            ) : null}
            {previewRecipients ? (
              <>
                <p className="font-medium">
                  {previewRecipients.count} recipients matched
                </p>
                {previewRecipients.sample.length > 0 ? (
                  <ul className="space-y-1 text-muted-foreground">
                    {previewRecipients.sample.map((contact, index) => (
                      <li
                        key={
                          contact.id ??
                          contact.email ??
                          `${contact.name ?? "contact"}-${index}`
                        }
                      >
                        {contact.name || "Unnamed contact"}
                        {contact.email ? ` - ${contact.email}` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    No sample recipients available yet.
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground">
                Run a preview to see who matches the current audience filters.
              </p>
            )}
          </CardContent>
        </Card>
      </form>
      <ConfirmDialog
        description="This will stop any queued sends and mark the campaign as cancelled."
        isOpen={isCancelOpen}
        loading={cancelCampaign.isPending}
        onConfirm={() => cancelCampaign.mutate()}
        setIsOpen={setIsCancelOpen}
        title="Cancel this campaign?"
      />
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
