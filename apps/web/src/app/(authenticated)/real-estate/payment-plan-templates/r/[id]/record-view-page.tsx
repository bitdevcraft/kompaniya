"use client";

import type { OrgPaymentPlanTemplate } from "@repo/database/schema";

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

import type { PaymentPlanTemplateRecordFormValues } from "./payment-plan-template-record-schema";

import { modelEndpoint } from "../../config";
import { paymentPlanTemplateRecordLayout } from "./payment-plan-template-record-layout";
import {
  createPaymentPlanTemplateFormDefaults,
  createPaymentPlanTemplateUpdatePayload,
  paymentPlanTemplateRecordSchema,
} from "./payment-plan-template-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgPaymentPlanTemplate;

  recordId: string;
}

const paymentPlanTemplateRecordQueryKey = (recordId: string) =>
  ["payment-plan-template-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(
    () => paymentPlanTemplateRecordQueryKey(recordId),
    [recordId],
  );

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchPaymentPlanTemplateRecord(recordId),
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
        ? createPaymentPlanTemplateFormDefaults(
            record,
            paymentPlanTemplateRecordLayout,
          )
        : undefined,
    [record],
  );

  const form = useForm<PaymentPlanTemplateRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(paymentPlanTemplateRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(
        createPaymentPlanTemplateFormDefaults(
          record,
          paymentPlanTemplateRecordLayout,
        ),
      );
    }
  }, [form, record]);

  const updatePaymentPlanTemplate = useMutation({
    mutationFn: (payload: Partial<OrgPaymentPlanTemplate>) =>
      updatePaymentPlanTemplateRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(
        createPaymentPlanTemplateFormDefaults(
          updated,
          paymentPlanTemplateRecordLayout,
        ),
      );
      setIsEditing(false);
      toast.success("Payment plan template updated");
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

    const parsed = paymentPlanTemplateRecordSchema.parse(values);
    const payload = createPaymentPlanTemplateUpdatePayload(
      record,
      parsed,
      paymentPlanTemplateRecordLayout,
    );

    try {
      await updatePaymentPlanTemplate.mutateAsync(payload);
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
        Unable to load this payment plan template record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updatePaymentPlanTemplate.isPending}
            onClick={() => {
              form.reset(
                createPaymentPlanTemplateFormDefaults(
                  record,
                  paymentPlanTemplateRecordLayout,
                ),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updatePaymentPlanTemplate.isPending} type="submit">
            {updatePaymentPlanTemplate.isPending ? (
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
            href="/real-estate/payment-plan-templates"
          >
            <ArrowLeft className="size-4" />
            Back to payment plan templates
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={paymentPlanTemplateRecordLayout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
  );
}

async function fetchPaymentPlanTemplateRecord(recordId: string) {
  const { data } = await axios.get<OrgPaymentPlanTemplate>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updatePaymentPlanTemplateRecord(
  recordId: string,
  payload: Partial<OrgPaymentPlanTemplate>,
) {
  const { data } = await axios.patch<OrgPaymentPlanTemplate>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
