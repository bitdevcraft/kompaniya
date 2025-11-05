"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/shared-ui/components/common/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/shared-ui/components/common/form";
import { Input } from "@repo/shared-ui/components/common/input";
import { Label } from "@repo/shared-ui/components/common/label";
import { HtmlEditor } from "@repo/shared-ui/components/monaco-editor/html-editor";
import { HtmlLivePreview } from "@repo/shared-ui/components/monaco-editor/html-live-preview";
import { HtmlPreviewer } from "@repo/shared-ui/components/monaco-editor/html-previewer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import z from "zod";

import { authClient } from "@/lib/auth/client";

import { dictTranslation, model, modelEndpoint } from "../config";
import { defaultHtml } from "./sample";

interface NewRecordFormProps {
  onFinish?: () => void;
}

const FormSchema = z.object({
  name: z.string().min(1, "Template name is missing"),
  subject: z.string(),
  body: z.string().min(1, "HTML Body of the Email Template is required"),
});

type FormValue = z.infer<typeof FormSchema>;

const livePreviewStyles = `body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  padding: 1.5rem;
  background-color: #f8fafc;
  color: #0f172a;
}`;

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
      body: defaultHtml,
      subject: "",
    },
  });

  const watchedHtml = useWatch({ control: form.control, name: "body" });

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
        <div className="flex flex-col gap-4 lg:flex-row h-[60vh]">
          <div className="flex-1">
            <Label>{t("form.body.label")}</Label>
            <HtmlEditor
              className="h-full"
              control={form.control}
              editorClassName="h-[60vh]"
              height={360}
              name="body"
            />
          </div>
          <HtmlLivePreview
            className="flex-1"
            html={watchedHtml ?? ""}
            previewStyles={livePreviewStyles}
          />
        </div>

        <div className="flex w-full justify-end gap-2">
          <HtmlPreviewer
            buttonProps={{ variant: "outline" }}
            html={watchedHtml ?? ""}
            title="Preview custom HTML"
          />
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
