import { UniqueIdentifier } from "@dnd-kit/core";
import { createParser } from "nuqs";

export const parseAsUniqueIdentifier = createParser({
  parse(queryValue: string) {
    return queryValue as UniqueIdentifier;
  },
  serialize(value: UniqueIdentifier) {
    return String(value);
  },
});
