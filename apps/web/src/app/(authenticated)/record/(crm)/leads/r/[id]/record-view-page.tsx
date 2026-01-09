"use client";

import type { OrgLead } from "@repo/database/schema";

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

import type { LeadRecordFormValues } from "./lead-record-schema";

import { modelEndpoint } from "../../config";
import {
  createLeadFormDefaults,
  createLeadUpdatePayload,
  leadRecordSchema,
} from "./lead-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgLead;

  recordId: string;
}

const leadRecordQueryKey = (recordId: string) =>
  ["lead-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_leads",
  ) as RecordPageLayout<LeadRecordFormValues>;

  const queryKey = useMemo(() => leadRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchLeadRecord(recordId),
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
    () => (record ? createLeadFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<LeadRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(leadRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createLeadFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateLead = useMutation({
    mutationFn: (payload: Partial<OrgLead>) =>
      updateLeadRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createLeadFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Lead updated");
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

    const parsed = leadRecordSchema.parse(values);
    const payload = createLeadUpdatePayload(record, parsed, layout);

    try {
      await updateLead.mutateAsync(payload);
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
      <div className="text-destructive">Unable to load this lead record.</div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateLead.isPending}
            onClick={() => {
              form.reset(createLeadFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateLead.isPending} type="submit">
            {updateLead.isPending ? (
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
          <Link className="inline-flex items-center gap-2" href="/record/leads">
            <ArrowLeft className="size-4" />
            Back to leads
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

async function fetchLeadRecord(recordId: string) {
  const { data } = await axios.get<OrgLead>(`${modelEndpoint}/r/${recordId}`, {
    withCredentials: true,
  });

  return data;
}

async function updateLeadRecord(recordId: string, payload: Partial<OrgLead>) {
  const { data } = await axios.patch<OrgLead>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
