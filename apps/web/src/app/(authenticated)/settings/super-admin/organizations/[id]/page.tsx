import { redirect } from "next/navigation";

import { getUser } from "@/server/get-session";

import { SuperAdminOrganizations } from "../super-admin-organizations";

const SUPER_ADMIN_ROLES = new Set(["super_admin", "superAdmin", "superadmin"]);

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page(props: PageProps) {
  const session = await getUser();
  const role = session?.user?.role ?? "";

  if (!SUPER_ADMIN_ROLES.has(role)) {
    redirect("/dashboard");
  }

  const params = await props.params;

  return <SuperAdminOrganizations organizationId={params.id} />;
}
