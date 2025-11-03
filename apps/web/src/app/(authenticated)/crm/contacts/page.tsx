import { SearchParams } from "@/types/search-params";
import { searchParamsCache } from "@/types/validations";

import { OrgDataTable } from "./data-table";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}
export default async function Page(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);
  return <OrgDataTable search={search} />;
}
