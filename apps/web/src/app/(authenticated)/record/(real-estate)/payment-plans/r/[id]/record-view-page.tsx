"use client";

import type { OrgPaymentPlan } from "@repo/database/schema";

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

import type { PaymentPlanRecordFormValues } from "./payment-plan-record-schema";

import { modelEndpoint } from "../../config";
import {
  createPaymentPlanFormDefaults,
  createPaymentPlanUpdatePayload,
  paymentPlanRecordSchema,
} from "./payment-plan-record-schema";

interface RecordViewPageProps {
  initialRecord?: OrgPaymentPlan;

  recordId: string;
}

const paymentPlanRecordQueryKey = (recordId: string) =>
  ["payment-plan-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const layout = useLayout(
    "org_payment_plans",
  ) as RecordPageLayout<PaymentPlanRecordFormValues>;

  const queryKey = useMemo(
    () => paymentPlanRecordQueryKey(recordId),
    [recordId],
  );

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchPaymentPlanRecord(recordId),
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
    () => (record ? createPaymentPlanFormDefaults(record, layout) : undefined),
    [layout, record],
  );

  const form = useForm<PaymentPlanRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(paymentPlanRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createPaymentPlanFormDefaults(record, layout));
    }
  }, [form, layout, record]);

  const updatePaymentPlan = useMutation({
    mutationFn: (payload: Partial<OrgPaymentPlan>) =>
      updatePaymentPlanRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createPaymentPlanFormDefaults(updated, layout));
      setIsEditing(false);
      toast.success("Payment plan updated");
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

    const parsed = paymentPlanRecordSchema.parse(values);
    const payload = createPaymentPlanUpdatePayload(record, parsed, layout);

    try {
      await updatePaymentPlan.mutateAsync(payload);
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
        Unable to load this payment plan record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updatePaymentPlan.isPending}
            onClick={() => {
              form.reset(createPaymentPlanFormDefaults(record, layout));
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updatePaymentPlan.isPending} type="submit">
            {updatePaymentPlan.isPending ? (
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
            href="/record/payment-plans"
          >
            <ArrowLeft className="size-4" />
            Back to payment plans
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

async function fetchPaymentPlanRecord(recordId: string) {
  const { data } = await axios.get<OrgPaymentPlan>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updatePaymentPlanRecord(
  recordId: string,
  payload: Partial<OrgPaymentPlan>,
) {
  const { data } = await axios.patch<OrgPaymentPlan>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
