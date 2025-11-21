"use client";

import type { OrgLead } from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/shared-ui/components/common/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { RecordLayoutRenderer } from "@/components/record-page/record-layout-renderer";

import type { LeadRecordFormValues } from "./lead-record-schema";

import { modelEndpoint } from "../../config";
import { leadRecordLayout } from "./lead-record-layout";
import {
  createLeadFormDefaults,
  createLeadUpdatePayload,
  leadRecordSchema,
} from "./lead-record-schema";

interface RecordViewPageProps {
  recordId: string;
}

export function RecordViewPage({ recordId }: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => ["lead-record", recordId] as const,
    [recordId],
  );

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axios.get<OrgLead>(
        `${modelEndpoint}/r/${recordId}`,
        {
          withCredentials: true,
        },
      );

      return data;
    },
    retry: false,
  });

  useEffect(() => {
    if (
      !isLoading &&
      axios.isAxiosError(error) &&
      error?.response?.status === 404
    ) {
      router.replace("/404");
    }
  }, [error, isLoading, router]);

  const form = useForm<LeadRecordFormValues>({
    defaultValues: record
      ? createLeadFormDefaults(record, leadRecordLayout)
      : undefined,
    resolver: zodResolver(leadRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createLeadFormDefaults(record, leadRecordLayout));
    }
  }, [form, record]);

  const updateLead = useMutation({
    mutationFn: async (payload: Partial<OrgLead>) => {
      const { data } = await axios.patch<OrgLead>(
        `${modelEndpoint}/r/${recordId}`,
        payload,
        {
          withCredentials: true,
        },
      );

      return data;
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!record) return;

    const parsed = leadRecordSchema.parse(values);
    const payload = createLeadUpdatePayload(record, parsed, leadRecordLayout);

    try {
      const updated = await updateLead.mutateAsync(payload);
      queryClient.setQueryData(queryKey, updated);
      form.reset(createLeadFormDefaults(updated, leadRecordLayout));
      setIsEditing(false);
      toast.success("Lead updated");
    } catch (_error) {
      toast.error("We couldn't save your changes. Please try again.");
    } finally {
      queryClient.invalidateQueries({ queryKey });
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
              form.reset(createLeadFormDefaults(record, leadRecordLayout));
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
          <Link className="inline-flex items-center gap-2" href="/crm/leads">
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
          layout={leadRecordLayout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
  );
}
