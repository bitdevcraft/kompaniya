import {
  getFiltersStateParser,
  getSortingStateParser,
} from "@repo/shared-ui/components/ts/data-table/lib/parsers";
import {
  createSearchParamsCache,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

export const createBaseSearchParams = <T>() => ({
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<T>().withDefault([]),
});

export const searchParamsCache = createSearchParamsCache({
  // advanced filter
  filters: getFiltersStateParser().withDefault([]),
  joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
  name: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sort: getSortingStateParser<any>().withDefault([]),
});

export type SearchParamsSchema = Awaited<
  ReturnType<typeof searchParamsCache.parse>
>;
