"use client";

import { Badge } from "@kompaniya/ui-common/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@kompaniya/ui-common/components/card";
import { Skeleton } from "@kompaniya/ui-common/components/skeleton";
import { useQuery } from "@tanstack/react-query";

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

interface SuperAdminOrganizationsProps {
  organizationId: string;
}

export function SuperAdminOrganizations({
  organizationId,
}: SuperAdminOrganizationsProps) {
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
      <CardContent className="space-y-6">
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
            <p className="text-xs text-muted-foreground">Email domain limit</p>
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Roles</p>
            {data.roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.role}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No custom roles.</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Members</p>
            {data.members.length > 0 ? (
              <ul className="space-y-2">
                {data.members.map((member) => (
                  <li
                    className="flex items-center justify-between gap-3 text-sm"
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
              <p className="text-sm text-muted-foreground">No members yet.</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold">Teams</p>
            {data.teams.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {data.teams.map((team) => (
                  <li
                    className="flex items-center justify-between gap-3"
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
              <p className="text-sm text-muted-foreground">No teams yet.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
