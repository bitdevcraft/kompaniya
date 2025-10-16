"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type ResetPasswordPayload,
  type ResetPasswordResponse,
  ResetPasswordSchema,
} from "@repo/shared";
import { Button } from "@repo/shared-ui/components/common/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/shared-ui/components/common/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/shared-ui/components/common/form";
import { Input } from "@repo/shared-ui/components/common/input";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";

export const useResetPasswordMutation = () => {
  const mutation = useMutation({
    mutationFn: async (
      payload: ResetPasswordPayload,
    ): Promise<ResetPasswordResponse> => {
      const { data, error } = await authClient.resetPassword({
        newPassword: payload.password, // required
        token: payload.token, // required
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

export const ResetPasswordForm = () => {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const t = useTranslations("auth");

  const form = useForm<ResetPasswordPayload>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", passwordAgain: "", token: token ?? "" },
    reValidateMode: "onChange",
  });

  const resetPassword = useResetPasswordMutation();
  const onSubmit: SubmitHandler<ResetPasswordPayload> = (data) => {
    resetPassword.mutate(data, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t("reset_password.title")}</CardTitle>
        <CardDescription>{t("reset_password.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("reset_password.form.password.label")}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordAgain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("reset_password.form.password_again.label")}
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                loading={resetPassword.isPending}
                type="submit"
              >
                {t("reset_password.form.save")}
              </Button>
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
