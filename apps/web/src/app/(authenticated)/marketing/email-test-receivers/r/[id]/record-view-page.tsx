"use client";

import type { OrgEmailTestReceiver } from "@repo/database/schema";

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

import { RecordLayoutRenderer } from "@/components/record-page/record-layout-renderer";

import type { EmailTestReceiverRecordFormValues } from "../../email-test-receiver-record-schema";

import { modelEndpoint } from "../../config";
import { emailTestReceiverRecordLayout } from "../../email-test-receiver-record-layout";
import {
  createEmailTestReceiverFormDefaults,
  createEmailTestReceiverUpdatePayload,
  emailTestReceiverRecordSchema,
} from "../../email-test-receiver-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgEmailTestReceiver;
  recordId: string;
}

const emailTestReceiverRecordQueryKey = (recordId: string) =>
  ["email-test-receiver-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => emailTestReceiverRecordQueryKey(recordId),
    [recordId],
  );

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchEmailTestReceiverRecord(recordId),
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
        ? createEmailTestReceiverFormDefaults(
            record,
            emailTestReceiverRecordLayout,
          )
        : undefined,
    [record],
  );

  const form = useForm<EmailTestReceiverRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(emailTestReceiverRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(
        createEmailTestReceiverFormDefaults(
          record,
          emailTestReceiverRecordLayout,
        ),
      );
    }
  }, [form, record]);

  const updateEmailTestReceiver = useMutation({
    mutationFn: (payload: Partial<OrgEmailTestReceiver>) =>
      updateEmailTestReceiverRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(
        createEmailTestReceiverFormDefaults(
          updated,
          emailTestReceiverRecordLayout,
        ),
      );
      setIsEditing(false);
      toast.success("Email test receiver updated");
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

    const parsed = emailTestReceiverRecordSchema.parse(values);
    const payload = createEmailTestReceiverUpdatePayload(
      record,
      parsed,
      emailTestReceiverRecordLayout,
    );

    try {
      await updateEmailTestReceiver.mutateAsync(payload);
    } catch (_error) {
      // handled by mutation onError
    }
  });

  const displayRecord = useMemo(() => {
    const emails = Array.isArray(record?.emails)
      ? record.emails.join("\n")
      : (record?.emails ?? "");
    return { ...record, emails };
  }, [record]);

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
        Unable to load this email test receiver record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateEmailTestReceiver.isPending}
            onClick={() => {
              form.reset(
                createEmailTestReceiverFormDefaults(
                  record,
                  emailTestReceiverRecordLayout,
                ),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateEmailTestReceiver.isPending} type="submit">
            {updateEmailTestReceiver.isPending ? (
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
            href="/marketing/email-test-receivers"
          >
            <ArrowLeft className="size-4" />
            Back to email test receivers
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={emailTestReceiverRecordLayout}
          record={displayRecord as Record<string, unknown>}
        />
      </form>
    </div>
  );
}

async function fetchEmailTestReceiverRecord(recordId: string) {
  const { data } = await axios.get<OrgEmailTestReceiver>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateEmailTestReceiverRecord(
  recordId: string,
  payload: Partial<OrgEmailTestReceiver>,
) {
  const { data } = await axios.patch<OrgEmailTestReceiver>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
