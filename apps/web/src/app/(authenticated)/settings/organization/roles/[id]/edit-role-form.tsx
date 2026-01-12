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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "@/lib/auth/client";

import { PermissionCheckboxGroup } from "../_components/permission-checkbox-group";
import { fetchRoles, updateRole } from "../actions";
import { type PermissionState, PROTECTED_ROLES } from "../config";

const UpdateRoleSchema = z.object({
  permissions: z.record(
    z.string(),
    z.array(z.enum(["create", "update", "delete"])),
  ),
});

interface EditRoleFormProps {
  roleId: string;
}

type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;

export function EditRoleForm({ roleId }: EditRoleFormProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  // Fetch role data
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles", activeOrganization?.id],
    queryFn: () =>
      activeOrganization?.id ? fetchRoles(activeOrganization.id, 1, 100) : null,
    enabled: !!activeOrganization?.id,
  });

  const role = rolesData?.find((r) => r.id === roleId);

  const form = useForm<UpdateRoleDto>({
    resolver: zodResolver(UpdateRoleSchema),
    defaultValues: {
      permissions: {},
    },
  });

  // Populate form with role data when available
  useEffect(() => {
    if (role) {
      try {
        const permission = role.permission;
        const permissions: PermissionState =
          typeof permission === "string" ? JSON.parse(permission) : permission;
        form.reset({ permissions });
      } catch {
        form.reset({ permissions: {} });
      }
    }
  }, [role, form]);

  const updateRoleMutation = useMutation({
    mutationFn: updateRole,
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: [`roles-${activeOrganization?.id}`],
      });
      router.push("/settings/organization/roles");
    },
  });

  const onSubmit = async (data: UpdateRoleDto) => {
    if (!role || !activeOrganization?.id) return;

    // Check if trying to edit a protected role
    if (
      PROTECTED_ROLES.includes(role.role as (typeof PROTECTED_ROLES)[number])
    ) {
      return;
    }

    await updateRoleMutation.mutateAsync({
      role: role.role,
      permission: data.permissions,
      organizationId: activeOrganization.id,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin size-8" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Role Not Found</h1>
          <p className="text-muted-foreground">
            The role you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  if (PROTECTED_ROLES.includes(role.role as (typeof PROTECTED_ROLES)[number])) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Protected Role</h1>
          <p className="text-muted-foreground">
            Default roles cannot be modified.
          </p>
        </div>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Role</h1>
        <p className="text-muted-foreground">
          Update permissions for the{" "}
          <span className="font-medium capitalize">{role.role}</span> role.
        </p>
      </div>

      <Form {...form}>
        <form
          className="space-y-6 max-w-4xl"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormItem>
            <FormLabel>Role Name</FormLabel>
            <FormControl>
              <Input className="bg-muted" disabled value={role.role} />
            </FormControl>
            <FormDescription>Role name cannot be changed</FormDescription>
            <FormMessage />
          </FormItem>

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
                      disabled={updateRoleMutation.isPending}
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
              disabled={updateRoleMutation.isPending}
              onClick={() => router.back()}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={updateRoleMutation.isPending} type="submit">
              {updateRoleMutation.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
