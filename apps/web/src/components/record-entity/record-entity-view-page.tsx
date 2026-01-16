"use client";

import type { DefaultValues, FieldValues } from "react-hook-form";

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

import type { RecordEntityViewPageConfig } from "./types";

export interface RecordEntityViewPageProps<
  TData extends { id: string },
  TFormData extends FieldValues,
> {
  config: RecordEntityViewPageConfig<TData>;
  recordId: string;
  initialRecord?: TData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
  useLayout: () => RecordPageLayout<TFormData>;
  createFormDefaults: (
    record: TData,
    layout: RecordPageLayout<TFormData>,
  ) => DefaultValues<TFormData>;
  createUpdatePayload: (
    record: TData,
    values: TFormData,
    layout: RecordPageLayout<TFormData>,
  ) => Partial<TData>;
  entityLabel: string;
}

export function RecordEntityViewPage<
  TData extends { id: string },
  TFormData extends FieldValues,
>({
  config,
  recordId,
  initialRecord,
  schema,
  useLayout,
  createFormDefaults,
  createUpdatePayload,
  entityLabel,
}: RecordEntityViewPageProps<TData, TFormData>) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout();
  const singularLabel = config.model?.name ?? entityLabel;
  const pluralLabel = config.model?.plural ?? entityLabel;
  const labelTitle = capitalize(singularLabel);

  const queryKey = useMemo(() => config.queryKey(recordId), [config, recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchRecord<TData>(config.modelEndpoint, recordId),
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

  const formDefaults = useMemo<DefaultValues<TFormData> | undefined>(
    () => (record ? createFormDefaults(record, layout) : undefined),
    [createFormDefaults, layout, record],
  );

  const form = useForm<TFormData>({
    defaultValues: formDefaults,
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createFormDefaults(record, layout));
    }
  }, [createFormDefaults, form, layout, record]);

  const updateRecord = useMutation({
    mutationFn: (payload: Partial<TData>) =>
      updateRecordById<TData>(config.modelEndpoint, recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success(`${labelTitle} updated`);
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

    const parsed = schema.parse(values) as TFormData;
    const payload = createUpdatePayload(record, parsed, layout);

    try {
      await updateRecord.mutateAsync(payload);
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
        Unable to load this {singularLabel} record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateRecord.isPending}
            onClick={() => {
              form.reset(createFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateRecord.isPending} type="submit">
            {updateRecord.isPending ? (
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
            href={config.basePath}
          >
            <ArrowLeft className="size-4" />
            Back to {pluralLabel}
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

function capitalize(value: string) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function fetchRecord<TData>(modelEndpoint: string, recordId: string) {
  const { data } = await axios.get<TData>(`${modelEndpoint}/r/${recordId}`, {
    withCredentials: true,
  });

  return data;
}

async function updateRecordById<TData>(
  modelEndpoint: string,
  recordId: string,
  payload: Partial<TData>,
) {
  const { data } = await axios.patch<TData>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
