import { sql } from "drizzle-orm";

import { db } from "@/db";

/**
 * Represents the type of the transaction object (`tx`) passed to the callback function
 * of `db.transaction`. This type is inferred from the first parameter of the callback
 * function used in `db.transaction`.
 *
 * Example:
 * If `db.transaction` is defined as:
 *   transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>
 * Then `Tx` will be inferred as `Transaction`.
 */
type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<unknown>
  ? T
  : never;

/**
 * Executes a function within a database transaction, setting the current organization context for the duration of the transaction.
 *
 * @template T The return type of the provided function.
 * @param organizationId - The ID of the organization to set as the current context for the transaction.
 * @param fn - An asynchronous function that receives the transaction object and performs database operations.
 * @returns A promise that resolves to the result of the provided function.
 *
 * @remarks
 * This function ensures that all database operations within the transaction are executed with the specified organization context.
 * The organization context is set using a session variable for the duration of the transaction.
 */
export async function withOrganizationTransaction<T>(
  organizationId: string,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute(
      sql`SET LOCAL app.current_organization = ${sql.raw(`'${organizationId}'`)}`,
    );

    const result = await fn(tx);

    return result;
  });
}
