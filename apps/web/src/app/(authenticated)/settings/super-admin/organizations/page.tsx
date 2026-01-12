import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";

import { getUser } from "@/server/get-session";
import { searchParamsCache } from "@/types/validations";

import { SuperAdminOrganizationsTable } from "./super-admin-organizations-table";

const SUPER_ADMIN_ROLES = new Set(["super_admin", "superAdmin", "superadmin"]);

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page(props: PageProps) {
  const session = await getUser();
  const role = session?.user?.role ?? "";

  if (!SUPER_ADMIN_ROLES.has(role)) {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  return <SuperAdminOrganizationsTable search={search} />;
}
