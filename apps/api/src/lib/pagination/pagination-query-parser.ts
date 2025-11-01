import { dataTableConfig } from '@repo/shared/config';
import z from 'zod';

const jsonStringTo = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .union([z.string(), schema])
    .transform((v) => {
      if (typeof v === 'string') {
        const s = v.trim();
        if (!s) return undefined as unknown as z.infer<T>;
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return JSON.parse(s);
        } catch {
          return v as unknown as z.infer<T>;
        }
      }
      return v as unknown as z.infer<T>;
    })
    .pipe(schema);

// helper: lowercase strings before enum check
const lower = z.preprocess(
  (v) => (typeof v === 'string' ? v.toLowerCase() : v),
  z.string(),
);

const filterItemSchema = z.object({
  id: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  variant: z.enum(dataTableConfig.filterVariants),
  operator: z.enum(dataTableConfig.operators),
  filterId: z.string(),
});

export type FilterItemType = z.infer<typeof filterItemSchema>;

const sortingItemSchema = z.object({
  id: z.string(),
  desc: z.coerce.boolean(),
});

export const basePaginationQueryParser = {
  name: z.string().default(''),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().default(10),
  joinOperator: lower.pipe(z.enum(['and', 'or'])).default('and'),
  filters: jsonStringTo(z.array(filterItemSchema)).default([]),
  sort: jsonStringTo(z.array(sortingItemSchema)).default([]),
};

export const paginationQueryParserSchema = z.object({
  ...basePaginationQueryParser,
});

export type PaginationQueryParserType = z.infer<
  typeof paginationQueryParserSchema
>;
