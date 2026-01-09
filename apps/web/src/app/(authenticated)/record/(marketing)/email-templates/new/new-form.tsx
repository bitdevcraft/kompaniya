"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kompaniya/ui-common/components/form";
import { Input } from "@kompaniya/ui-common/components/input";
import {
  type EmailEditorOutputs,
  UiEditor,
} from "@kompaniya/ui-email-editor/editor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { authClient } from "@/lib/auth/client";

import { dictTranslation, model, modelEndpoint } from "../config";

interface NewRecordFormProps {
  onFinish?: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Template name is missing"),
  subject: z.string(),
  body: z.string().min(1, "Email HTML is required"),
  htmlContent: z.string().optional(),
  mjmlContent: z.string().optional(),
  mjmlJsonContent: z.string().optional(),
});

type FormValue = z.infer<typeof FormSchema>;

const useSubmit = () => {
  return useMutation({
    mutationFn: async (payload: FormValue) => {
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

  const form = useForm<FormValue>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      body: "",
      htmlContent: "",
      mjmlContent: "",
      mjmlJsonContent: "",
      subject: "",
    },
  });

  const handleOutputsChange = useCallback(
    (outputs: EmailEditorOutputs) => {
      form.setValue("mjmlContent", outputs.mjmlOutput, { shouldDirty: true });
      form.setValue("mjmlJsonContent", outputs.jsonOutput, {
        shouldDirty: true,
      });
      form.setValue("htmlContent", outputs.htmlOutput, { shouldDirty: true });
      form.setValue("body", outputs.htmlOutput, { shouldDirty: true });
    },
    [form],
  );

  const submit = useSubmit();

  const onSubmit: SubmitHandler<FormValue> = (data) => {
    submit.mutate(data, {
      onSuccess: () => {
        if (onFinish) onFinish();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          form.setError("name", {
            type: "custom",
            message: error.response?.data?.message || error.message,
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
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.name.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.name.label")} {...field} />
              </FormControl>
              <FormDescription>{t("form.name.description")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.subject.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.subject.label")} {...field} />
              </FormControl>
              <FormDescription>{t("form.subject.description")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <input type="hidden" {...form.register("htmlContent")} />
        <input type="hidden" {...form.register("mjmlContent")} />
        <input type="hidden" {...form.register("mjmlJsonContent")} />
        <div className="min-h-svh">
          <UiEditor onOutputsChange={handleOutputsChange} />
        </div>

        <div className="flex w-full justify-end gap-2">
          <Button
            className="w-full md:w-auto"
            disabled={submit.isPending}
            onClick={onFinish}
            variant={"outline"}
          >
            Cancel
          </Button>
          <Button
            className="w-full md:w-auto"
            disabled={submit.isPending}
            type="submit"
          >
            {submit.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>{t("form.new.submit")}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
