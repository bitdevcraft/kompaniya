"use client";

import type { OrgTag } from "@repo/database/schema";

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

import type { TagRecordFormValues } from "./tags-record-schema";

import { modelEndpoint } from "../../config";
import {
  createTagFormDefaults,
  createTagUpdatePayload,
  tagRecordSchema,
} from "./tags-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgTag;

  recordId: string;
}

const tagRecordQueryKey = (recordId: string) =>
  ["tag-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout("org_tags") as RecordPageLayout<TagRecordFormValues>;

  const queryKey = useMemo(() => tagRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchTagRecord(recordId),
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
    () => (record ? createTagFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<TagRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(tagRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createTagFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateTag = useMutation({
    mutationFn: (payload: Partial<OrgTag>) =>
      updateTagRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createTagFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Tag updated");
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

    const parsed = tagRecordSchema.parse(values);
    const payload = createTagUpdatePayload(record, parsed, layout);

    try {
      await updateTag.mutateAsync(payload);
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
      <div className="text-destructive">Unable to load this tag record.</div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateTag.isPending}
            onClick={() => {
              form.reset(createTagFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateTag.isPending} type="submit">
            {updateTag.isPending ? (
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
          <Link className="inline-flex items-center gap-2" href="/record/tags">
            <ArrowLeft className="size-4" />
            Back to tags
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          entityType="org_tags"
          form={form}
          isEditing={isEditing}
          layout={layout}
          record={record as Record<string, unknown>}
          recordId={recordId}
        />
      </form>
    </div>
  );
}

async function fetchTagRecord(recordId: string) {
  const { data } = await axios.get<OrgTag>(`${modelEndpoint}/r/${recordId}`, {
    withCredentials: true,
  });

  return data;
}

async function updateTagRecord(recordId: string, payload: Partial<OrgTag>) {
  const { data } = await axios.patch<OrgTag>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
