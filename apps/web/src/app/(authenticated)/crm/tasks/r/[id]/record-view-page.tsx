"use client";

import type { OrgTask } from "@repo/database/schema";

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

import type { TaskRecordFormValues } from "./tasks-record-schema";

import { modelEndpoint } from "../../config";
import {
  createTaskFormDefaults,
  createTaskUpdatePayload,
  taskRecordSchema,
} from "./tasks-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgTask;

  recordId: string;
}

const taskRecordQueryKey = (recordId: string) =>
  ["task-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_tasks",
  ) as RecordPageLayout<TaskRecordFormValues>;

  const queryKey = useMemo(() => taskRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchTaskRecord(recordId),
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
    () => (record ? createTaskFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<TaskRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(taskRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createTaskFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateTask = useMutation({
    mutationFn: (payload: Partial<OrgTask>) =>
      updateTaskRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createTaskFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Task updated");
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

    const parsed = taskRecordSchema.parse(values);
    const payload = createTaskUpdatePayload(record, parsed, layout);

    try {
      await updateTask.mutateAsync(payload);
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
      <div className="text-destructive">Unable to load this task record.</div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateTask.isPending}
            onClick={() => {
              form.reset(createTaskFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateTask.isPending} type="submit">
            {updateTask.isPending ? (
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
          <Link className="inline-flex items-center gap-2" href="/crm/tasks">
            <ArrowLeft className="size-4" />
            Back to tasks
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

async function fetchTaskRecord(recordId: string) {
  const { data } = await axios.get<OrgTask>(`${modelEndpoint}/r/${recordId}`, {
    withCredentials: true,
  });

  return data;
}

async function updateTaskRecord(recordId: string, payload: Partial<OrgTask>) {
  const { data } = await axios.patch<OrgTask>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
