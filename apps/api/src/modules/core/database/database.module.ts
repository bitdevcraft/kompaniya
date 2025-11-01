import { Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { db, queryClient } from '@repo/database';
import { DRIZZLE_DB, PG_CLIENT } from 'src/constants/provider';

import { OrganizationRepositoryService } from './repository/organization-repository/organization-repository.service';
import { PaginationRepositoryService } from './repository/pagination-repository/pagination-repository.service';
import { SessionRepositoryService } from './repository/session-repository/session-repository.service';
import { UserRepositoryService } from './repository/user-repository/user-repository.service';

@Global()
@Module({
  providers: [
    { provide: DRIZZLE_DB, useValue: db },
    { provide: PG_CLIENT, useValue: queryClient },
    SessionRepositoryService,
    OrganizationRepositoryService,
    UserRepositoryService,
    PaginationRepositoryService,
  ],
  exports: [
    DRIZZLE_DB,
    PG_CLIENT,
    SessionRepositoryService,
    OrganizationRepositoryService,
    UserRepositoryService,
    PaginationRepositoryService,
  ],
})
export class DatabaseModule implements OnApplicationShutdown {
  async onApplicationShutdown() {
    await queryClient.end?.();
  }
}

export { DRIZZLE_DB };
