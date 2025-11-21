"use client";

import type { OrgAccount } from "@repo/database/schema";

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

import type { AccountRecordFormValues } from "../../account-record-schema";

import { accountRecordLayout } from "../../account-record-layout";
import {
  accountRecordSchema,
  createAccountFormDefaults,
  createAccountUpdatePayload,
} from "../../account-record-schema";
import { modelEndpoint } from "../../config";

interface RecordViewPageProps {
  initialRecord?: OrgAccount;

  recordId: string;
}

const accountRecordQueryKey = (recordId: string) =>
  ["account-record", recordId] as const;

export function RecordViewPage({
  initialRecord,
  recordId,
}: RecordViewPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const queryKey = useMemo(() => accountRecordQueryKey(recordId), [recordId]);

  const {
    data: record,
    error,
    isLoading,
  } = useQuery({
    queryKey,
    queryFn: () => fetchAccountRecord(recordId),
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
        ? createAccountFormDefaults(record, accountRecordLayout)
        : undefined,
    [record],
  );

  const form = useForm<AccountRecordFormValues>({
    defaultValues: formDefaults,
    resolver: zodResolver(accountRecordSchema),
  });

  useEffect(() => {
    if (record) {
      form.reset(createAccountFormDefaults(record, accountRecordLayout));
    }
  }, [form, record]);

  const updateAccount = useMutation({
    mutationFn: (payload: Partial<OrgAccount>) =>
      updateAccountRecord(recordId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      form.reset(createAccountFormDefaults(updated, accountRecordLayout));
      setIsEditing(false);
      toast.success("Account updated");
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

    const parsed = accountRecordSchema.parse(values);
    const payload = createAccountUpdatePayload(
      record,
      parsed,
      accountRecordLayout,
    );

    try {
      await updateAccount.mutateAsync(payload);
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
        Unable to load this account record.
      </div>
    );
  }

  const actionButtons = (
    <div className="flex flex-wrap justify-end gap-2">
      {isEditing ? (
        <>
          <Button
            disabled={updateAccount.isPending}
            onClick={() => {
              form.reset(
                createAccountFormDefaults(record, accountRecordLayout),
              );
              setIsEditing(false);
            }}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={updateAccount.isPending} type="submit">
            {updateAccount.isPending ? (
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
          <Link className="inline-flex items-center gap-2" href="/crm/accounts">
            <ArrowLeft className="size-4" />
            Back to accounts
          </Link>
        </Button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <RecordLayoutRenderer
          actionButtons={actionButtons}
          form={form}
          isEditing={isEditing}
          layout={accountRecordLayout}
          record={record as Record<string, unknown>}
        />
      </form>
    </div>
  );
}

async function fetchAccountRecord(recordId: string) {
  const { data } = await axios.get<OrgAccount>(
    `${modelEndpoint}/r/${recordId}`,
    {
      withCredentials: true,
    },
  );

  return data;
}

async function updateAccountRecord(
  recordId: string,
  payload: Partial<OrgAccount>,
) {
  const { data } = await axios.patch<OrgAccount>(
    `${modelEndpoint}/r/${recordId}`,
    payload,
    {
      withCredentials: true,
    },
  );

  return data;
}
