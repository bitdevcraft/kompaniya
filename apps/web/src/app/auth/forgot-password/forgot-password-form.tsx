"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kompaniya/ui-common/components/form";
import { Input } from "@kompaniya/ui-common/components/input";
import {
  type ForgotPasswordPayload,
  type ForgotPasswordResponse,
  ForgotPasswordSchema,
} from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

export const useForgotPasswordMutation = () => {
  const mutation = useMutation({
    mutationFn: async (
      payload: ForgotPasswordPayload,
    ): Promise<ForgotPasswordResponse> => {
      const { data, error } = await authClient.requestPasswordReset({
        email: payload.email, // required
        redirectTo: `${env.NEXT_PUBLIC_BASE_CLIENT_URL}/auth/reset-password`,
      });

      if (error) throw new Error(error.message);

      return !!data;
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return mutation;
};

export const ForgotPasswordForm = () => {
  const t = useTranslations("auth");

  const form = useForm<ForgotPasswordPayload>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
    reValidateMode: "onChange",
  });

  const forgotPassword = useForgotPasswordMutation();
  const onSubmit: SubmitHandler<ForgotPasswordPayload> = (data) => {
    forgotPassword.mutate(data);
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t("forgot_password.title")}</CardTitle>
        <CardDescription>{t("forgot_password.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("forgot_password.form.email.label")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={forgotPassword.data === true}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                disabled={forgotPassword.data === true}
                loading={forgotPassword.isPending}
                type="submit"
              >
                {forgotPassword.data === true &&
                  t("forgot_password.form.link_sent")}

                {!forgotPassword.data &&
                  t("forgot_password.form.send_reset_link")}
              </Button>

              {forgotPassword.data === true && (
                <span className="text-center text-sm text-muted-foreground">
                  {t("forgot_password.form.check_inbox")}
                </span>
              )}
            </div>
            <div className="mt-4 text-center text-sm">
              <Link className="ml-1 underline" href="/auth/login">
                {t("login_button")}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
