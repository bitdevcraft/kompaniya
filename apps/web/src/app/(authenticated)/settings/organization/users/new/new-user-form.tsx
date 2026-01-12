"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kompaniya/ui-common/components/button";
import { Checkbox } from "@kompaniya/ui-common/components/checkbox";
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
import { Skeleton } from "@kompaniya/ui-common/components/skeleton";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { env } from "@/env/client";
import { authClient } from "@/lib/auth/client";

import { fetchRoles } from "../../roles/actions";

const CreateUserSchema = z.object({
  data: z.record(z.string(), z.any()).optional(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string(),
  role: z.array(z.string()).min(1, "At least one role must be selected"),
});

type CreateUserDto = z.infer<typeof CreateUserSchema>;

const useCreateUser = () => {
  return useMutation({
    mutationFn: async (payload: CreateUserDto) => {
      const response = await axios.post(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/organization/system-admin/create-user`,
        {
          name: [payload.lastName, payload.firstName].join(", "),
          password: payload.password,
          role: payload.role,
          email: payload.email,
        },
        {
          withCredentials: true,
        },
      );

      return response.data;
    },
  });
};

interface NewUserFormProps {
  onFinish?: () => void;
}

export function NewUserForm(props: NewUserFormProps) {
  const t = useTranslations("settings.user");
  const form = useForm<CreateUserDto>({
    resolver: zodResolver(CreateUserSchema),
    reValidateMode: "onChange",
    defaultValues: {
      role: [],
    },
  });

  const qc = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  // Fetch dynamic roles from the organization
  const { data: roles, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles", activeOrganization?.id],
    queryFn: () =>
      activeOrganization?.id ? fetchRoles(activeOrganization.id, 1, 100) : null,
    enabled: !!activeOrganization?.id,
  });

  const createUser = useCreateUser();
  const onSubmit: SubmitHandler<CreateUserDto> = (data) => {
    createUser.mutate(data, {
      onSuccess: async () => {
        await qc.invalidateQueries({
          queryKey: [`users-${activeOrganization?.id}`],
        });

        if (props.onFinish) props.onFinish();
      },
    });
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.email.label")}</FormLabel>
              <FormControl>
                <Input placeholder="name@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.firstName.label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.firstName.label")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.lastName.label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.lastName.label")} {...field} />
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
                <FormLabel>{t("form.password.label")}</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.role.label")}</FormLabel>
              <FormDescription>{t("form.role.description")}</FormDescription>
              {rolesLoading ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      className="flex items-center gap-3 rounded-xl border p-3"
                      key={i}
                    >
                      <Skeleton className="size-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {roles?.map((role) => {
                    const checked =
                      Array.isArray(field.value) &&
                      field.value.includes(role.role);
                    return (
                      <label
                        className="flex items-center gap-3 rounded-xl border p-3"
                        key={role.id}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(isChecked) => {
                            const v = Array.isArray(field.value)
                              ? field.value.slice()
                              : [];
                            if (isChecked) {
                              if (!v.includes(role.role)) v.push(role.role);
                            } else {
                              const idx = v.indexOf(role.role);
                              if (idx >= 0) v.splice(idx, 1);
                            }
                            field.onChange(v);
                          }}
                        />
                        <span className="capitalize">{role.role}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full justify-end gap-2">
          <Button
            className="w-full md:w-auto"
            disabled={createUser.isPending}
            onClick={props.onFinish}
            variant={"outline"}
          >
            Cancel
          </Button>
          <Button
            className="w-full md:w-auto"
            disabled={createUser.isPending || rolesLoading}
            type="submit"
          >
            {createUser.isPending ? (
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
