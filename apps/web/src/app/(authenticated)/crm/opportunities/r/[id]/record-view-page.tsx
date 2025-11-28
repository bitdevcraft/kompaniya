"use client";

import type { OrgOpportunity } from "@repo/database/schema";

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

import type { OpportunityRecordFormValues } from "../../opportunity-record-schema";

import { modelEndpoint } from "../../config";
import { opportunityRecordLayout } from "../../opportunity-record-layout";
import {
  createOpportunityFormDefaults,
  createOpportunityUpdatePayload,
  opportunityRecordSchema,
} from "../../opportunity-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgOpportunity;

  recordId: string;
}

const opportunityRecordQueryKey = (recordId: string) =>
  ["opportunity-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => opportunityRecordQueryKey(recordId),
    [recordId],
  );

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchOpportunityRecord(recordId),
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
        ? createOpportunityFormDefaults(record, opportunityRecordLayout)
        : undefined,
    [record],
  );

  const form = useForm<OpportunityRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(opportunityRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(
        createOpportunityFormDefaults(record, opportunityRecordLayout),
      );
    }
  }, [form, record]);

  const updateOpportunity = useMutation({
    mutationFn: (payload: Partial<OrgOpportunity>) =>
      updateOpportunityRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(
        createOpportunityFormDefaults(updated, opportunityRecordLayout),
      );
      setIsEditing(false);
      toast.success("Opportunity updated");
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

    const parsed = opportunityRecordSchema.parse(values);
    const payload = createOpportunityUpdatePayload(
      record,
      parsed,
      opportunityRecordLayout,
    );

    try {
      await updateOpportunity.mutateAsync(payload);
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
        Unable to load this opportunity record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateOpportunity.isPending}
            onClick={() => {
              form.reset(
                createOpportunityFormDefaults(record, opportunityRecordLayout),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateOpportunity.isPending} type="submit">
            {updateOpportunity.isPending ? (
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
            href="/crm/opportunities"
          >
            <ArrowLeft className="size-4" />
            Back to opportunities
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={opportunityRecordLayout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
  );
}

async function fetchOpportunityRecord(recordId: string) {
  const { data } = await axios.get<OrgOpportunity>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateOpportunityRecord(
  recordId: string,
  payload: Partial<OrgOpportunity>,
) {
  const { data } = await axios.patch<OrgOpportunity>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
