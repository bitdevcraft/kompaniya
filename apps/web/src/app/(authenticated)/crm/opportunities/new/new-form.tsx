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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { SubmitHandler, useForm } from "react-hook-form";
import z from "zod";

import { authClient } from "@/lib/auth/client";

import { dictTranslation, model, modelEndpoint } from "../config";

interface NewRecordFormProps {
  onFinish?: () => void;
}

const FormSchema = z.object({
  email: z.email().min(1),
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
      email: "",
    },
  });

  const submit = useSubmit();

  const onSubmit: SubmitHandler<FormValue> = (data) => {
    submit.mutate(data, {
      onSuccess: () => {
        if (onFinish) onFinish();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          form.setError("email", {
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.email.label")}</FormLabel>
              <FormControl>
                <Input placeholder={t("form.email.label")} {...field} />
              </FormControl>
              <FormDescription>{t("form.email.description")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
