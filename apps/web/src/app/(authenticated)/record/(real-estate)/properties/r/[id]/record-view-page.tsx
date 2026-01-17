"use client";

import type { OrgRealEstateProperty } from "@repo/database/schema";

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

import type { PropertyRecordFormValues } from "./property-record-schema";

import { modelEndpoint } from "../../config";
import {
  createPropertyFormDefaults,
  createPropertyUpdatePayload,
  propertyRecordSchema,
} from "./property-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgRealEstateProperty;

  recordId: string;
}

const propertyRecordQueryKey = (recordId: string) =>
  ["property-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_real_estate_properties",
  ) as RecordPageLayout<PropertyRecordFormValues>;

  const queryKey = useMemo(() => propertyRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchPropertyRecord(recordId),
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
    () => (record ? createPropertyFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<PropertyRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(propertyRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createPropertyFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateProperty = useMutation({
    mutationFn: (payload: Partial<OrgRealEstateProperty>) =>
      updatePropertyRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createPropertyFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Property updated");
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

    const parsed = propertyRecordSchema.parse(values);
    const payload = createPropertyUpdatePayload(record, parsed, layout);

    try {
      await updateProperty.mutateAsync(payload);
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
        Unable to load this property record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateProperty.isPending}
            onClick={() => {
              form.reset(createPropertyFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateProperty.isPending} type="submit">
            {updateProperty.isPending ? (
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
            href="/record/properties"
          >
            <ArrowLeft className="size-4" />
            Back to properties
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          entityType="org_real_estate_properties"
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

async function fetchPropertyRecord(recordId: string) {
  const { data } = await axios.get<OrgRealEstateProperty>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updatePropertyRecord(
  recordId: string,
  payload: Partial<OrgRealEstateProperty>,
) {
  const { data } = await axios.patch<OrgRealEstateProperty>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
