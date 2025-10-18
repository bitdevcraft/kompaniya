import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { db, queryClient } from '@repo/database';

export const DRIZZLE_DB = Symbol('DRIZZLE_DB');
export const PG_CLIENT = Symbol('PG_CLIENT');

@Global()
@Module({
  providers: [
    { provide: DRIZZLE_DB, useValue: db },
    { provide: PG_CLIENT, useValue: queryClient },
  ],
  exports: [DRIZZLE_DB, PG_CLIENT],
})
export class DatabaseModule implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await queryClient.end?.();
  }
}
