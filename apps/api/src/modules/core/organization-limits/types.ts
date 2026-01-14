export enum LimitType {
  USERS = 'users',
  EMAIL_DOMAINS = 'email_domains',
  ROLES = 'roles',
  TEAMS = 'teams',
}

export interface LimitCheckResult {
  allowed: boolean;
  current: number;
  limit: number | null; // null = unlimited
  remaining: number | null; // null = unlimited
}

export interface OrganizationLimits {
  numberOfUsers: number | null;
  numberOfEmailDomains: number | null;
  numberOfRoles: number | null;
  numberOfTeams: number | null;
}

export interface OrganizationUsage {
  users: number;
  emailDomains: number;
  roles: number;
  teams: number;
  limits: {
    numberOfUsers: number | null;
    numberOfEmailDomains: number | null;
    numberOfRoles: number | null;
    numberOfTeams: number | null;
  };
}
