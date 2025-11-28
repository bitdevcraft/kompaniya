"use client";

import type { OrgActivity } from "@repo/database/schema";

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

import type { ActivityRecordFormValues } from "./activity-record-schema";

import { modelEndpoint } from "../../config";
import { activityRecordLayout } from "./activity-record-layout";
import {
  activityRecordSchema,
  createActivityFormDefaults,
  createActivityUpdatePayload,
} from "./activity-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgActivity;

  recordId: string;
}

const activityRecordQueryKey = (recordId: string) =>
  ["activity-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => activityRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchActivityRecord(recordId),
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
        ? createActivityFormDefaults(record, activityRecordLayout)
        : undefined,
    [record],
  );

  const form = useForm<ActivityRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(activityRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createActivityFormDefaults(record, activityRecordLayout));
    }
  }, [form, record]);

  const updateActivity = useMutation({
    mutationFn: (payload: Partial<OrgActivity>) =>
      updateActivityRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createActivityFormDefaults(updated, activityRecordLayout));
      setIsEditing(false);
      toast.success("Activity updated");
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

    const parsed = activityRecordSchema.parse(values);
    const payload = createActivityUpdatePayload(
      record,
      parsed,
      activityRecordLayout,
    );

    try {
      await updateActivity.mutateAsync(payload);
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
        Unable to load this activity record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateActivity.isPending}
            onClick={() => {
              form.reset(
                createActivityFormDefaults(record, activityRecordLayout),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateActivity.isPending} type="submit">
            {updateActivity.isPending ? (
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
            href="/crm/activities"
          >
            <ArrowLeft className="size-4" />
            Back to activities
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={activityRecordLayout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
  );
}

async function fetchActivityRecord(recordId: string) {
  const { data } = await axios.get<OrgActivity>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateActivityRecord(
  recordId: string,
  payload: Partial<OrgActivity>,
) {
  const { data } = await axios.patch<OrgActivity>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
