"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

import {
  createDefaultValuesForLayout,
  extractCreateValues,
} from "@/components/record-page/layout-helpers";
import { RecordCreateForm } from "@/components/record-page/record-create-form";
import { authClient } from "@/lib/auth/client";

import { accountRecordLayout } from "../account-record-layout";
import {
  AccountRecordFormValues,
  accountRecordSchema,
  AccountRecordSubmitValues,
} from "../account-record-schema";
import { dictTranslation, model, modelEndpoint } from "../config";

interface NewRecordFormProps {
  onFinish?: () => void;
}

const useSubmit = () => {
  return useMutation({
    mutationFn: async (payload: AccountRecordSubmitValues) => {
      const res = await axios.post(`${modelEndpoint}`, payload, {
        withCredentials: true,
      });

      return res.data;
    },
  });
};

export function NewRecordForm({ onFinish }: NewRecordFormProps) {
  const t = useTranslations(dictTranslation);
  const queryClient = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const form = useForm<AccountRecordFormValues>({
    resolver: zodResolver(accountRecordSchema),
    defaultValues: createDefaultValuesForLayout(accountRecordLayout),
  });

  const submit = useSubmit();

  const onSubmit = (values: AccountRecordFormValues) => {
    const payload = extractCreateValues(values, accountRecordLayout);

    submit.mutate(payload as AccountRecordSubmitValues, {
      onSuccess: () => {
        if (onFinish) onFinish();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || error.message;
          form.setError("name", {
            type: "custom",
            message,
          });
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: [`${model.plural}-${activeOrganization?.id}`],
        });
      },
    });
  };

  return (
    <RecordCreateForm
      form={form}
      isSubmitting={submit.isPending}
      layout={accountRecordLayout}
      onCancel={onFinish}
      onSubmit={onSubmit}
      submitLabel={t("form.new.submit")}
    />
  );
}
