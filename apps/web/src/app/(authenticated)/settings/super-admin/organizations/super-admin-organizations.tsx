"use client";

import type { Resolver } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Badge } from "@kompaniya/ui-common/components/badge";
import { Button } from "@kompaniya/ui-common/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@kompaniya/ui-common/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kompaniya/ui-common/components/form";
import { Input } from "@kompaniya/ui-common/components/input";
import { Skeleton } from "@kompaniya/ui-common/components/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kompaniya/ui-common/components/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { env } from "@/env/client";

type OrganizationMember = {
  id: string;
  role: string;
  createdAt: string;
  user: OrganizationUser | null;
};

type OrganizationRole = {
  id: string;
  role: string;
  permission: string;
  createdAt: string;
  updatedAt: string | null;
};

type OrganizationTeam = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string | null;
  teamMembers: OrganizationTeamMember[];
};

type OrganizationTeamMember = {
  id: string;
  userId: string;
  createdAt: string | null;
  user: OrganizationUser | null;
};

type OrganizationUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  active: boolean | null;
};

type SuperAdminOrganization = {
  id: string;
  name: string;
  slug: string;
  organizationSize: string | null;
  industry: string | null;
  isSuper: boolean | null;
  numberOfUsers: number | null;
  numberOfEmailDomains: number | null;
  numberOfRoles: number | null;
  numberOfTeams: number | null;
  members: OrganizationMember[];
  roles: OrganizationRole[];
  teams: OrganizationTeam[];
};

const formatLimit = (value: number | null | undefined) =>
  value === null || value === undefined ? "N/A" : value.toString();

const getDisplayName = (user?: OrganizationUser | null) =>
  user?.name?.trim() ? user.name : (user?.email ?? "Unknown user");

const limitSchema = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => {
    if (value === null || value === "" || value === undefined) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  })
  .nullable();

const updateOrganizationLimitsSchema = z.object({
  numberOfUsers: limitSchema,
  numberOfEmailDomains: limitSchema,
  numberOfRoles: limitSchema,
  numberOfTeams: limitSchema,
});

type UpdateOrganizationLimitsFormValues = z.infer<
  typeof updateOrganizationLimitsSchema
>;

const createLimitDefaults = (organization?: SuperAdminOrganization) => ({
  numberOfUsers: organization?.numberOfUsers ?? null,
  numberOfEmailDomains: organization?.numberOfEmailDomains ?? null,
  numberOfRoles: organization?.numberOfRoles ?? null,
  numberOfTeams: organization?.numberOfTeams ?? null,
});

interface SuperAdminOrganizationsProps {
  organizationId: string;
}

export function SuperAdminOrganizations({
  organizationId,
}: SuperAdminOrganizationsProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isLimitsOpen, setIsLimitsOpen] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["super-admin-organization", organizationId],
    queryFn: async () => {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/super-admin/organizations/r/${organizationId}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load organization");
      }

      return (await response.json()) as SuperAdminOrganization;
    },
  });

  const form = useForm<UpdateOrganizationLimitsFormValues>({
    resolver: zodResolver(
      updateOrganizationLimitsSchema,
    ) as Resolver<UpdateOrganizationLimitsFormValues>,
    defaultValues: createLimitDefaults(),
  });

  useEffect(() => {
    if (!data) return;
    form.reset(createLimitDefaults(data));
  }, [data, form]);

  const updateLimits = useMutation({
    mutationFn: async (payload: UpdateOrganizationLimitsFormValues) => {
      const response = await fetch(
        `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/super-admin/organizations/r/${organizationId}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update limits");
      }

      return (await response.json()) as SuperAdminOrganization;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(
        ["super-admin-organization", organizationId],
        updated,
      );
      queryClient.invalidateQueries({
        queryKey: ["super-admin-organizations"],
      });
      form.reset(createLimitDefaults(updated));
      setIsLimitsOpen(false);
      toast.success("Organization limits updated");
      router.refresh();
    },
    onError: () => {
      toast.error("We couldn't save the limits. Please try again.");
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updateLimits.mutate(values);
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, statIndex) => (
              <Skeleton
                className="h-16 w-full"
                key={`stat-skeleton-${statIndex}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            We could not load this organization right now.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Organization not found.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const memberCount = data.members.length;
  const roleCount = data.roles.length;
  const teamCount = data.teams.length;

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{data.name}</CardTitle>
          {data.isSuper ? <Badge variant="secondary">Super</Badge> : null}
        </div>
        <CardDescription>{data.slug}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Limits</p>
              <p className="text-xs text-muted-foreground">
                Adjust how large this organization can grow.
              </p>
            </div>
            <Dialog
              onOpenChange={(open) => {
                setIsLimitsOpen(open);
                if (open) {
                  form.reset(createLimitDefaults(data));
                }
              }}
              open={isLimitsOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">Edit limits</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Update organization limits</DialogTitle>
                  <DialogDescription>
                    Leave a field blank to remove the limit.
                  </DialogDescription>
                </DialogHeader>
                <Form<UpdateOrganizationLimitsFormValues> {...form}>
                  <form className="space-y-4" onSubmit={onSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="numberOfUsers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User limit</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                min={0}
                                placeholder="Unlimited"
                                type="number"
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numberOfEmailDomains"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email domain limit</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                min={0}
                                placeholder="Unlimited"
                                type="number"
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numberOfRoles"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role limit</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                min={0}
                                placeholder="Unlimited"
                                type="number"
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numberOfTeams"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Team limit</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                min={0}
                                placeholder="Unlimited"
                                type="number"
                                value={field.value ?? ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => setIsLimitsOpen(false)}
                        type="button"
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button disabled={updateLimits.isPending} type="submit">
                        {updateLimits.isPending ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : null}
                        Save limits
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">User limit</p>
              <p className="text-lg font-semibold">
                {formatLimit(data.numberOfUsers)}
              </p>
              <p className="text-xs text-muted-foreground">
                {memberCount} members
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">
                Email domain limit
              </p>
              <p className="text-lg font-semibold">
                {formatLimit(data.numberOfEmailDomains)}
              </p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Role limit</p>
              <p className="text-lg font-semibold">
                {formatLimit(data.numberOfRoles)}
              </p>
              <p className="text-xs text-muted-foreground">{roleCount} roles</p>
            </div>
            <div className="rounded-md border p-3">
              <p className="text-xs text-muted-foreground">Team limit</p>
              <p className="text-lg font-semibold">
                {formatLimit(data.numberOfTeams)}
              </p>
              <p className="text-xs text-muted-foreground">{teamCount} teams</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Tabs defaultValue="members">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="members">Members ({memberCount})</TabsTrigger>
              <TabsTrigger value="roles">Roles ({roleCount})</TabsTrigger>
              <TabsTrigger value="teams">Teams ({teamCount})</TabsTrigger>
            </TabsList>
            <TabsContent className="mt-4" value="members">
              {data.members.length > 0 ? (
                <ul className="divide-y rounded-md border">
                  {data.members.map((member) => (
                    <li
                      className="flex items-center justify-between gap-3 p-3 text-sm"
                      key={member.id}
                    >
                      <div>
                        <p className="font-medium">
                          {getDisplayName(member.user)}
                        </p>
                        {member.user?.email ? (
                          <p className="text-xs text-muted-foreground">
                            {member.user.email}
                          </p>
                        ) : null}
                      </div>
                      <Badge variant="outline">{member.role}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No members yet.
                </div>
              )}
            </TabsContent>
            <TabsContent className="mt-4" value="roles">
              {data.roles.length > 0 ? (
                <div className="rounded-md border p-4">
                  <div className="flex flex-wrap gap-2">
                    {data.roles.map((role) => (
                      <Badge key={role.id} variant="secondary">
                        {role.role}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No custom roles.
                </div>
              )}
            </TabsContent>
            <TabsContent className="mt-4" value="teams">
              {data.teams.length > 0 ? (
                <ul className="divide-y rounded-md border text-sm">
                  {data.teams.map((team) => (
                    <li
                      className="flex items-center justify-between gap-3 p-3"
                      key={team.id}
                    >
                      <p className="font-medium">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.teamMembers.length} members
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  No teams yet.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
