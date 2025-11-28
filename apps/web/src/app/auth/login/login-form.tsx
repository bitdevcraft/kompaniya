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
  type LoginWithEmailPasswordPayload,
  type LoginWithEmailPasswordResponse,
  LoginWithEmailPasswordSchema,
} from "@repo/shared";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { authClient } from "@/lib/auth/client";

export const useLoginWithEmailAndPassword = () => {
  return useMutation({
    mutationFn: async (
      payload: LoginWithEmailPasswordPayload,
    ): Promise<LoginWithEmailPasswordResponse> => {
      const { data, error: errSignIn } = await authClient.signIn.email({
        email: payload.email,
        password: payload.password,
        rememberMe: true,
      });

      if (errSignIn) throw new Error(errSignIn.message);

      const { data: organizations, error: orgListError } =
        await authClient.organization.list();

      if (orgListError) throw new Error(orgListError.message);

      if (organizations.length === 0)
        throw new Error("No Organization Available");

      const { error: errActiveOrganization } =
        await authClient.organization.setActive({
          organizationId: organizations[0].id,
          organizationSlug: organizations[0].slug,
        });

      if (errActiveOrganization) throw new Error(errActiveOrganization.message);

      const userData = data.user as typeof data.user & { role: string };
      return {
        email_address: userData.email,
        id: userData.id,
        name: userData.name,
        role: userData.role,
        is_email_address_verified: userData.emailVerified,
      };
    },
  });
};

export const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations("auth");

  const form = useForm<LoginWithEmailPasswordPayload>({
    resolver: zodResolver(LoginWithEmailPasswordSchema),
    defaultValues: { email: "", password: "" },
    reValidateMode: "onChange",
  });

  const login = useLoginWithEmailAndPassword();
  const onSubmit: SubmitHandler<LoginWithEmailPasswordPayload> = (data) => {
    login.mutate(data, {
      onSuccess: () => {
        router.push("/dashboard");
      },
      onError: (_err) => {
        toast.error(
          "Invalid email or password. Check with your admin or support",
        );
      },
    });
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t("login.title")}</CardTitle>
        <CardDescription>{t("login.description")}</CardDescription>
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
                    <FormLabel>{t("login.form.email.label")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center">
                      <FormLabel>{t("login.form.password.label")}</FormLabel>
                      <Link
                        className="ml-auto inline-block text-sm underline"
                        href="/auth/forgot-password"
                      >
                        {t("login.form.forgot_password.label")}
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                className="w-full"
                loading={login.isPending}
                type="submit"
              >
                {t("login_button")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("login.dont_have_account")}
              <Link className="ml-1 underline" href="/auth/onboarding">
                {t("signup_button")}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
