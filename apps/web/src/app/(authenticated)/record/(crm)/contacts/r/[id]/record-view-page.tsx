"use client";

import type { OrgContact } from "@repo/database/schema";

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

import type { ContactRecordFormValues } from "./contact-record-schema";

import { modelEndpoint } from "../../config";
import {
  contactRecordSchema,
  createContactFormDefaults,
  createContactUpdatePayload,
} from "./contact-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgContact;

  recordId: string;
}

const contactRecordQueryKey = (recordId: string) =>
  ["contact-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_contacts",
  ) as RecordPageLayout<ContactRecordFormValues>;

  const queryKey = useMemo(() => contactRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchContactRecord(recordId),
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
    () => (record ? createContactFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<ContactRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(contactRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createContactFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updateContact = useMutation({
    mutationFn: (payload: Partial<OrgContact>) =>
      updateContactRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createContactFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Contact updated");
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

    const parsed = contactRecordSchema.parse(values);
    const payload = createContactUpdatePayload(record, parsed, layout);

    try {
      await updateContact.mutateAsync(payload);
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
        Unable to load this contact record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateContact.isPending}
            onClick={() => {
              form.reset(createContactFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateContact.isPending} type="submit">
            {updateContact.isPending ? (
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
            href="/record/contacts"
          >
            <ArrowLeft className="size-4" />
            Back to contacts
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

async function fetchContactRecord(recordId: string) {
  const { data } = await axios.get<OrgContact>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateContactRecord(
  recordId: string,
  payload: Partial<OrgContact>,
) {
  const { data } = await axios.patch<OrgContact>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
