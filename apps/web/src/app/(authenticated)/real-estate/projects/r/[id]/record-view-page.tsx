"use client";

import type { OrgRealEstateProject } from "@repo/database/schema";

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

import type { ProjectRecordFormValues } from "./project-record-schema";

import { modelEndpoint } from "../../config";
import { projectRecordLayout } from "./project-record-layout";
import {
  createProjectFormDefaults,
  createProjectUpdatePayload,
  projectRecordSchema,
} from "./project-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgRealEstateProject;

  recordId: string;
}

const projectRecordQueryKey = (recordId: string) =>
  ["project-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => projectRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchProjectRecord(recordId),
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
        ? createProjectFormDefaults(record, projectRecordLayout)
        : undefined,
    [record],
  );

  const form = useForm<ProjectRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(projectRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createProjectFormDefaults(record, projectRecordLayout));
    }
  }, [form, record]);

  const updateProject = useMutation({
    mutationFn: (payload: Partial<OrgRealEstateProject>) =>
      updateProjectRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createProjectFormDefaults(updated, projectRecordLayout));
      setIsEditing(false);
      toast.success("Project updated");
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

    const parsed = projectRecordSchema.parse(values);
    const payload = createProjectUpdatePayload(
      record,
      parsed,
      projectRecordLayout,
    );

    try {
      await updateProject.mutateAsync(payload);
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
        Unable to load this project record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateProject.isPending}
            onClick={() => {
              form.reset(
                createProjectFormDefaults(record, projectRecordLayout),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateProject.isPending} type="submit">
            {updateProject.isPending ? (
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
            href="/real-estate/projects"
          >
            <ArrowLeft className="size-4" />
            Back to projects
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={projectRecordLayout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
  );
}

async function fetchProjectRecord(recordId: string) {
  const { data } = await axios.get<OrgRealEstateProject>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateProjectRecord(
  recordId: string,
  payload: Partial<OrgRealEstateProject>,
) {
  const { data } = await axios.patch<OrgRealEstateProject>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
