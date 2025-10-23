"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  type SignUpWithPasswordPayload,
  SignUpWithPasswordSchema,
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
import { useRouter } from "next/navigation";
import { type SubmitHandler, useForm } from "react-hook-form";

import { authClient } from "@/lib/auth/client";

const useSignupWithPassword = () => {
  return useMutation({
    mutationFn: async (payload: SignUpWithPasswordPayload) => {
      const { data, error } = await authClient.signUp.email({
        email: payload.email,
        password: payload.password,
        name: payload.name,
        // @ts-expect-error never
        metadata: null,
      });

      if (error) throw new Error(error.message);

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

const useSignupWithGoogle = () => {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authClient.signIn.social({
        provider: "google",
      });

      if (error) throw new Error(error.message);

      return data;
    },
  });
};

export const SignupForm = () => {
  const t = useTranslations("auth");
  const router = useRouter();

  const form = useForm<SignUpWithPasswordPayload>({
    resolver: zodResolver(SignUpWithPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    reValidateMode: "onChange",
  });

  const signup = useSignupWithPassword();
  const onSubmit: SubmitHandler<SignUpWithPasswordPayload> = (data) => {
    signup.mutate(data, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  const signupWithGoogle = useSignupWithGoogle();
  const onSignupWithGoogle = () => {
    signupWithGoogle.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{t("signup.title")}</CardTitle>
        <CardDescription>{t("signup.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("signup.form.name.label")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("signup.form.email.label")}</FormLabel>
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
                  <FormLabel>{t("signup.form.password.label")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" loading={signup.isPending} type="submit">
              {t("signup_button")}
            </Button>
            <Button
              className="w-full"
              loading={signupWithGoogle.isPending}
              onClick={onSignupWithGoogle}
              type="button"
              variant="outline"
            >
              {t("social_login.google")}
            </Button>
            <div className="mt-4 text-center text-sm">
              {t("signup.already_have_account")}
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
