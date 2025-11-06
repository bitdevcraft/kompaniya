"use client";

import type { OrgContact } from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/shared-ui/components/common/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { RecordLayoutRenderer } from "@/components/record-page";

import type { ContactRecordFormValues } from "./contact-record-schema";

import { contactRecordLayout } from "./contact-record-layout";
import {
  contactRecordSchema,
  createContactFormDefaults,
  createContactUpdatePayload,
} from "./contact-record-schema";

interface RecordViewPageProps {
  record: OrgContact;
}

export function RecordViewPage({ record }: RecordViewPageProps) {
  const [currentRecord, setCurrentRecord] = useState(record);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ContactRecordFormValues>({
    defaultValues: createContactFormDefaults(record, contactRecordLayout),
    resolver: zodResolver(contactRecordSchema),
  });

  const updateContact = useMutation({
    mutationFn: async (payload: Partial<OrgContact>) => {
      const { data } = await axios.patch<OrgContact>(
        `/api/organization/contact/r/${currentRecord.id}`,
        payload,
      );

      return data;
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const parsed = contactRecordSchema.parse(values);
    const payload = createContactUpdatePayload(currentRecord, parsed, contactRecordLayout);

    try {
      const updated = await updateContact.mutateAsync(payload);
      setCurrentRecord(updated);
      form.reset(createContactFormDefaults(updated, contactRecordLayout));
      setIsEditing(false);
      toast.success("Contact updated");
    } catch (_error) {
      toast.error("We couldn't save your changes. Please try again.");
    }
  });

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateContact.isPending}
            onClick={() => {
              form.reset(createContactFormDefaults(currentRecord, contactRecordLayout));
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
          <Link className="inline-flex items-center gap-2" href="/crm/contacts">
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
          layout={contactRecordLayout}
          record={currentRecord as Record<string, unknown>}
        />
      </form>
    </div>
  );
}
