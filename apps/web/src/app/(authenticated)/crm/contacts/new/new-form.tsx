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
import { contactRecordLayout } from "../r/[id]/contact-record-layout";
import {
  ContactRecordFormValues,
  contactRecordSchema,
  ContactRecordSubmitValues,
} from "../r/[id]/contact-record-schema";

interface NewRecordFormProps {
  onFinish?: () => void;
}

const useSubmit = () => {
  return useMutation({
    mutationFn: async (payload: ContactRecordSubmitValues) => {
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

  const form = useForm<ContactRecordFormValues>({
    resolver: zodResolver(contactRecordSchema),
    defaultValues: createDefaultValuesForLayout(contactRecordLayout),
  });

  const submit = useSubmit();

  const onSubmit = (values: ContactRecordFormValues) => {
    const payload = extractCreateValues(values, contactRecordLayout);

    submit.mutate(payload as ContactRecordSubmitValues, {
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
      layout={contactRecordLayout}
      onCancel={onFinish}
      onSubmit={onSubmit}
      submitLabel={t("form.new.submit")}
    />
  );
}
