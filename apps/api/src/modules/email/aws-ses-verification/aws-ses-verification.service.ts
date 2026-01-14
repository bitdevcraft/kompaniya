import { Inject, Injectable, Logger } from '@nestjs/common';
import { type Db } from '@repo/database';
import {
  type OrgEmailDomain,
  orgEmailDomainsTable,
} from '@repo/database/schema';
import { and, eq, inArray, isNull } from 'drizzle-orm';

import { Keys } from '~/constants/cache-keys';
import { DRIZZLE_DB } from '~/constants/provider';
import { CacheService } from '~/modules/core/cache/cache.service';

import { AwsSesIdentityService } from '../aws-ses-identity/aws-ses-identity.service';

@Injectable()
export class AwsSesVerificationService {
  private readonly batchSize = 99;
  private readonly logger = new Logger(AwsSesVerificationService.name);

  constructor(
    private readonly awsSesIdentity: AwsSesIdentityService,
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly cacheService: CacheService,
  ) {}

  async updateIdentities() {
    const pendingDomains = await this.getPendingDomains();
    if (pendingDomains.length === 0) {
      return { checked: 0, verified: 0 };
    }

    const identityMap = new Map<string, OrgEmailDomain>();
    for (const domain of pendingDomains) {
      const identity = domain.name ?? this.extractDomain(domain.email);
      if (!identity) {
        this.logger.warn(`Skipping domain ${domain.id}: missing identity.`);
        continue;
      }
      identityMap.set(identity, domain);
    }

    const identities = [...identityMap.keys()];
    if (identities.length === 0) {
      return { checked: 0, verified: 0 };
    }

    try {
      const verification =
        await this.awsSesIdentity.getIdentityVerificationAttributes(identities);

      const attributes = verification?.VerificationAttributes ?? {};
      const verifiedDomains: OrgEmailDomain[] = [];

      for (const identity of identities) {
        const record = identityMap.get(identity);
        if (!record) {
          continue;
        }

        const status = attributes[identity]?.VerificationStatus;
        if (!status) {
          this.logger.warn(
            `SES did not return verification status for ${identity}.`,
          );
          continue;
        }

        if (status === 'Success') {
          verifiedDomains.push(record);
        }
      }

      if (verifiedDomains.length === 0) {
        return { checked: identities.length, verified: 0 };
      }

      const updated = await this.db
        .update(orgEmailDomainsTable)
        .set({ status: 'READY', verified: true })
        .where(
          inArray(
            orgEmailDomainsTable.id,
            verifiedDomains.map((domain) => domain.id),
          ),
        )
        .returning();

      await Promise.all(updated.map((domain) => this.invalidateCaches(domain)));

      return { checked: identities.length, verified: updated.length };
    } catch (error) {
      if (this.isSesThrottlingError(error)) {
        this.logger.warn(
          'SES throttling detected while verifying domains, retrying with backoff.',
        );
        throw error;
      }

      this.logger.error('Failed to update SES identities.', error as Error);
      throw error;
    }
  }

  private extractDomain(identity?: string | null) {
    if (!identity) return '';
    return identity.includes('@') ? (identity.split('@')[1] ?? '') : identity;
  }

  private async getPendingDomains() {
    return this.db
      .select()
      .from(orgEmailDomainsTable)
      .where(
        and(
          eq(orgEmailDomainsTable.status, 'PENDING'),
          isNull(orgEmailDomainsTable.deletedAt),
        ),
      )
      .limit(this.batchSize);
  }

  private async invalidateCaches(domain: OrgEmailDomain) {
    if (domain.organizationId) {
      await this.cacheService.delete(
        Keys.Domain.idByOrg(domain.id, domain.organizationId),
      );
    }

    if (domain.name) {
      await this.cacheService.delete(Keys.Domain.name(domain.name));
    }

    if (domain.email) {
      await this.cacheService.delete(Keys.Domain.emailAttributes(domain.email));
    }

    if (domain.secret) {
      await this.cacheService.delete(Keys.Domain.secretKey(domain.secret));
    }

    if (domain.public) {
      await this.cacheService.delete(Keys.Domain.publicKey(domain.public));
    }
  }

  private isSesThrottlingError(error: unknown) {
    if (!error || typeof error !== 'object') return false;
    const err = error as {
      name?: string;
      $metadata?: { httpStatusCode?: number };
    };
    return (
      err.name === 'ThrottlingException' ||
      err.name === 'TooManyRequestsException' ||
      err.$metadata?.httpStatusCode === 429
    );
  }
}
