import { SearchParams } from "nuqs";

import { searchParamsCache } from "@/types/validations";

import { RolesTable } from "./roles-table";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);
  return <RolesTable search={search} />;
}
