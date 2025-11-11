"use client";

import type { OrgLead } from "@repo/database/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/shared-ui/components/common/button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { RecordLayoutRenderer } from "@/components/record-page/record-layout-renderer";

import type { LeadRecordFormValues } from "./lead-record-schema";

import { modelEndpoint } from "../../config";
import { leadRecordLayout } from "./lead-record-layout";
import {
  createLeadFormDefaults,
  createLeadUpdatePayload,
  leadRecordSchema,
} from "./lead-record-schema";

interface RecordViewPageProps {
  record: OrgLead;
}

export function RecordViewPage({ record }: RecordViewPageProps) {
  const [currentRecord, setCurrentRecord] = useState(record);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<LeadRecordFormValues>({
    defaultValues: createLeadFormDefaults(record, leadRecordLayout),
    resolver: zodResolver(leadRecordSchema),
  });

  const updateLead = useMutation({
    mutationFn: async (payload: Partial<OrgLead>) => {
      const { data } = await axios.patch<OrgLead>(
        `${modelEndpoint}/r/${currentRecord.id}`,
        payload,
        {
          withCredentials: true,
        },
      );

      return data;
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    const parsed = leadRecordSchema.parse(values);
    const payload = createLeadUpdatePayload(
      currentRecord,
      parsed,
      leadRecordLayout,
    );

    try {
      const updated = await updateLead.mutateAsync(payload);
      setCurrentRecord(updated);
      router.refresh();
      setIsEditing(false);
      toast.success("Lead updated");
    } catch (_error) {
      toast.error("We couldn't save your changes. Please try again.");
    }
  });

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateLead.isPending}
            onClick={() => {
              form.reset(
                createLeadFormDefaults(currentRecord, leadRecordLayout),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateLead.isPending} type="submit">
            {updateLead.isPending ? (
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
          <Link className="inline-flex items-center gap-2" href="/crm/leads">
            <ArrowLeft className="size-4" />
            Back to leads
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={leadRecordLayout}
          record={currentRecord as Record<string, unknown>}
        />
      </form>
    </div>
  );
}
