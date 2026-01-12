"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import type { RecordPageLayout } from "@/components/record-page/layout";

import {
  createDefaultValuesForLayout,
  extractCreateValues,
} from "@/components/record-page/layout-helpers";
import { RecordCreateForm } from "@/components/record-page/record-create-form";
import { useLayout } from "@/components/record-page/use-layout";
import { authClient } from "@/lib/auth/client";

import { dictTranslation, model, modelEndpoint } from "../config";
import {
  PropertyRecordFormValues,
  propertyRecordSchema,
  PropertyRecordSubmitValues,
} from "../r/[id]/property-record-schema";

interface NewRecordFormProps {
  onFinish?: () => void;
}

const useSubmit = () => {
  return useMutation({
    mutationFn: async (payload: PropertyRecordSubmitValues) => {
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
  const layout = useLayout(
    "org_real_estate_properties",
  ) as RecordPageLayout<PropertyRecordFormValues>;

  const formDefaults = useMemo(
    () => createDefaultValuesForLayout(layout),
    [layout],
  );

  const form = useForm<PropertyRecordFormValues>({
    resolver: zodResolver(propertyRecordSchema),
    defaultValues: formDefaults,
  });
  const isDirty = form.formState.isDirty;

  useEffect(() => {
    if (!isDirty) {
      form.reset(formDefaults);
    }
  }, [form, formDefaults, isDirty]);

  const submit = useSubmit();

  const onSubmit = (values: PropertyRecordFormValues) => {
    const payload = extractCreateValues(values, layout);

    submit.mutate(payload as PropertyRecordSubmitValues, {
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
      layout={layout}
      onCancel={onFinish}
      onSubmit={onSubmit}
      submitLabel={t("form.new.submit")}
    />
  );
}
