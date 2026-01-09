"use client";

import type { OrgCategory } from "@repo/database/schema";

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

import type { CategoryRecordFormValues } from "./categories-record-schema";

import { modelEndpoint } from "../../config";
import {
  categoryRecordSchema,
  createCategoryFormDefaults,
  createCategoryUpdatePayload,
} from "./categories-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgCategory;

  recordId: string;
}

const categoryRecordQueryKey = (recordId: string) =>
  ["category-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_categories",
  ) as RecordPageLayout<CategoryRecordFormValues>;

  const queryKey = useMemo(() => categoryRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchCategoryRecord(recordId),
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
    () => (record ? createCategoryFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<CategoryRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(categoryRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createCategoryFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateCategory = useMutation({
    mutationFn: (payload: Partial<OrgCategory>) =>
      updateCategoryRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createCategoryFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Category updated");
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

    const parsed = categoryRecordSchema.parse(values);
    const payload = createCategoryUpdatePayload(record, parsed, layout);

    try {
      await updateCategory.mutateAsync(payload);
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
        Unable to load this category record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateCategory.isPending}
            onClick={() => {
              form.reset(createCategoryFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateCategory.isPending} type="submit">
            {updateCategory.isPending ? (
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
            href="/crm/categories"
          >
            <ArrowLeft className="size-4" />
            Back to categories
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

async function fetchCategoryRecord(recordId: string) {
  const { data } = await axios.get<OrgCategory>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateCategoryRecord(
  recordId: string,
  payload: Partial<OrgCategory>,
) {
  const { data } = await axios.patch<OrgCategory>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
