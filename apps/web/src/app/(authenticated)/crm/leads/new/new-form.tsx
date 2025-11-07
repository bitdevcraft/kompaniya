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

import { dictTranslation, model, modelEndpoint } from "../config";
import { leadRecordLayout } from "../r/[id]/lead-record-layout";
import {
  LeadRecordFormValues,
  leadRecordSchema,
  LeadRecordSubmitValues,
} from "../r/[id]/lead-record-schema";

interface NewRecordFormProps {
  onFinish?: () => void;
}

const useSubmit = () => {
  return useMutation({
    mutationFn: async (payload: LeadRecordSubmitValues) => {
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

  const form = useForm<LeadRecordFormValues>({
    resolver: zodResolver(leadRecordSchema),
    defaultValues: createDefaultValuesForLayout(leadRecordLayout),
  });

  const submit = useSubmit();

  const onSubmit = (values: LeadRecordFormValues) => {
    const payload = extractCreateValues(values, leadRecordLayout);

    submit.mutate(payload as LeadRecordSubmitValues, {
      onSuccess: () => {
        if (onFinish) onFinish();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || error.message;
          form.setError("email", {
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
      layout={leadRecordLayout}
      onCancel={onFinish}
      onSubmit={onSubmit}
      submitLabel={t("form.new.submit")}
    />
  );
}
