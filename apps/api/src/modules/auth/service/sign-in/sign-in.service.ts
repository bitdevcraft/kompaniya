import { Inject, Injectable } from '@nestjs/common';
import { type Db } from '@repo/database';
import { membersTable } from '@repo/database/schema';
import { eq } from 'drizzle-orm';
import { DRIZZLE_DB } from 'src/modules/database/database.module';

@Injectable()
export class SignInService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: Db) {}

  async getActiveOrganization(userId: string) {
    const member = await this.db.query.membersTable.findFirst({
      where: eq(membersTable.userId, userId),
      with: {
        organization: true,
      },
    });

    return member?.organization;
  }
}
