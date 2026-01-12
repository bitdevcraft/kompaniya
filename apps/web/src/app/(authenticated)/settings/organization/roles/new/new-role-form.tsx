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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";

import { PermissionCheckboxGroup } from "../_components/permission-checkbox-group";
import { createRole } from "../actions";
import { PROTECTED_ROLES } from "../config";

const CreateRoleSchema = z.object({
  role: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(50, "Role name must not exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Role name must contain only lowercase letters, numbers, and hyphens",
    )
    .refine((val) => !PROTECTED_ROLES.includes(val), {
      message: "This role name is reserved and cannot be used",
    }),
  permissions: z.record(
    z.string(),
    z.array(z.enum(["create", "update", "delete"])),
  ),
});

type CreateRoleDto = z.infer<typeof CreateRoleSchema>;

interface NewRoleFormProps {
  onFinish?: () => void;
}

export function NewRoleForm(_props: NewRoleFormProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const form = useForm<CreateRoleDto>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: {
      role: "",
      permissions: {},
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: createRole,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: [`roles-${activeOrganization?.id}`],
      });
      router.push("/settings/organization/roles");
    },
  });

  const onSubmit = async (data: CreateRoleDto) => {
    if (!activeOrganization?.id) return;

    await createRoleMutation.mutateAsync({
      role: data.role,
      permission: data.permissions,
      organizationId: activeOrganization.id,
    });
  };

  return (
    <Form {...form}>
      <form
        className="space-y-6 max-w-4xl"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., sales-manager"
                  {...field}
                  disabled={createRoleMutation.isPending}
                />
              </FormControl>
              <FormDescription>
                Use lowercase letters, numbers, and hyphens only
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Permissions</FormLabel>
          <FormDescription className="mb-4">
            Select the resources and actions this role can access
          </FormDescription>

          <FormField
            control={form.control}
            name="permissions"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PermissionCheckboxGroup
                    disabled={createRoleMutation.isPending}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex w-full justify-end gap-2">
          <Button
            disabled={createRoleMutation.isPending}
            onClick={() => router.back()}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={createRoleMutation.isPending} type="submit">
            {createRoleMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create Role"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
