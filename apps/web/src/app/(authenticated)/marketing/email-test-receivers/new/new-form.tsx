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
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import z from "zod";

import { authClient } from "@/lib/auth/client";

import { dictTranslation, model, modelEndpoint } from "../config";

interface NewRecordFormProps {
  onFinish?: () => void;
}

const FormSchema = z.object({
  email: z.array(z.email().min(1)),
  name: z.string().min(1),
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
      email: [],
      name: "",
    },
  });

  const emailFields = useFieldArray({
    control: form.control,
    // @ts-expect-error name
    name: "email",
  });

  const submit = useSubmit();

  const onSubmit: SubmitHandler<FormValue> = (data) => {
    const sanitizedData: FormValue = {
      ...data,
      email: data.email.map((email) => email.trim()),
    };

    submit.mutate(sanitizedData, {
      onSuccess: () => {
        if (onFinish) onFinish();
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          //
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
          name="email"
          render={() => (
            <FormItem>
              <FormLabel>{t("form.email.label")}</FormLabel>
              <div className="space-y-2">
                {emailFields.fields.map((field, index) => (
                  <FormField
                    control={form.control}
                    key={field.id}
                    name={`email.${index}`}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t("form.email.label")}
                              type="email"
                            />
                          </FormControl>
                          {emailFields.fields.length > 1 && (
                            <Button
                              aria-label={t("form.email.remove")}
                              className="h-9 w-9"
                              disabled={submit.isPending}
                              onClick={() => emailFields.remove(index)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button
                className="mt-2 flex items-center gap-2"
                disabled={submit.isPending}
                onClick={() => emailFields.append("", { shouldFocus: true })}
                type="button"
                variant="ghost"
              >
                <PlusCircle className="h-4 w-4" />
                {t("form.email.add")}
              </Button>
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
