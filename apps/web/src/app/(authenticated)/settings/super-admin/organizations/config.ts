import { env } from "@/env/client";

export type tableType = {
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
  memberCount: number;
  roleCount: number;
  teamCount: number;
};

export const model = {
  name: "organization",
  plural: "organizations",
};

export const modelEndpoint = `${env.NEXT_PUBLIC_BASE_SERVER_URL}/api/super-admin/${model.plural}`;
