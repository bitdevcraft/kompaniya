import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Db } from '@repo/database';
import {
  type OrgEmailDomain,
  type OrgEmailDomainDailyStats,
  orgEmailDomainDailyStatsTable,
  orgEmailDomainsTable,
} from '@repo/database/schema';
import { and, eq, gte, lt, sql } from 'drizzle-orm';

import { WARMUP_DAILY_LIMIT, WARMUP_PERIOD_DAYS } from '~/config/config.type';
import { DRIZZLE_DB } from '~/constants/provider';

export interface DailyCapacity {
  remaining: number;
  sentToday: number;
  limit: number;
  isInWarmup: boolean;
  daysUntilWarmupComplete: number | null;
}

@Injectable()
export class DomainWarmupService {
  private readonly logger = new Logger(DomainWarmupService.name);

  constructor(
    @Inject(DRIZZLE_DB) private readonly db: Db,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Get the daily capacity for a domain
   */
  async getDailyCapacity(
    domainId: string,
    date: Date = new Date(),
  ): Promise<DailyCapacity> {
    const domain = await this.db.query.orgEmailDomainsTable.findFirst({
      where: eq(orgEmailDomainsTable.id, domainId),
    });

    if (!domain) {
      throw new Error(`Domain not found: ${domainId}`);
    }

    const dailyLimit = domain.dailyLimit ?? this.getDailyLimit();
    const isInWarmup = this.isInWarmupPeriod(domain);

    const dateStr = this.getUtcDateString(date);

    // Get or create daily stats
    let stats = await this.db.query.orgEmailDomainDailyStatsTable.findFirst({
      where: and(
        eq(orgEmailDomainDailyStatsTable.orgEmailDomainId, domainId),
        eq(orgEmailDomainDailyStatsTable.date, dateStr),
      ),
    });

    if (!stats) {
      // Create new stats record for today
      const records = await this.db
        .insert(orgEmailDomainDailyStatsTable)
        .values({
          orgEmailDomainId: domainId,
          organizationId: domain.organizationId ?? '',
          date: dateStr,
          sentCount: 0,
        })
        .returning();
      stats = records[0];
      if (!stats) {
        throw new Error('Failed to create daily stats record');
      }
    }

    const sentToday = stats.sentCount ?? 0;
    const remaining = Math.max(0, dailyLimit - sentToday);

    return {
      remaining,
      sentToday,
      limit: dailyLimit,
      isInWarmup,
      daysUntilWarmupComplete: isInWarmup
        ? this.getDaysUntilWarmupComplete(domain)
        : null,
    };
  }

  /**
   * Get daily stats for a domain within a date range
   */
  async getDailyStats(
    domainId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<OrgEmailDomainDailyStats[]> {
    const startDateStr = this.getUtcDateString(startDate);
    const endDateStr = this.getUtcDateString(endDate);

    return await this.db.query.orgEmailDomainDailyStatsTable.findMany({
      where: and(
        eq(orgEmailDomainDailyStatsTable.orgEmailDomainId, domainId),
        gte(orgEmailDomainDailyStatsTable.date, startDateStr),
        lt(orgEmailDomainDailyStatsTable.date, endDateStr),
      ),
      orderBy: (stats, { asc }) => [asc(stats.date)],
    });
  }

  /**
   * Get days until warm-up is complete
   */
  getDaysUntilWarmupComplete(domain: OrgEmailDomain): number | null {
    if (!domain.firstEmailSentAt || domain.warmupCompletedAt) {
      return null;
    }

    const warmupPeriodDays = this.getWarmupPeriodDays();
    const warmupEndDate = new Date(domain.firstEmailSentAt);
    warmupEndDate.setDate(warmupEndDate.getDate() + warmupPeriodDays);

    const diff = warmupEndDate.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return days > 0 ? days : 0;
  }

  /**
   * Check if a domain has capacity for more emails today
   */
  async hasCapacity(
    domainId: string,
    count: number = 1,
    date: Date = new Date(),
  ): Promise<boolean> {
    const capacity = await this.getDailyCapacity(domainId, date);
    return capacity.remaining >= count;
  }

  /**
   * Check if a domain is in warm-up period
   */
  isInWarmupPeriod(domain: OrgEmailDomain): boolean {
    if (!domain.firstEmailSentAt) {
      return false; // Not started yet
    }

    if (domain.warmupCompletedAt) {
      return false; // Already completed
    }

    const warmupPeriodDays = this.getWarmupPeriodDays();
    const warmupEndDate = new Date(domain.firstEmailSentAt);
    warmupEndDate.setDate(warmupEndDate.getDate() + warmupPeriodDays);

    return new Date() < warmupEndDate;
  }

  /**
   * Record a sent email for a domain
   * This increments the daily sent count and handles warm-up tracking
   */
  async recordSentEmail(
    domainId: string,
    _emailId?: string,
    date: Date = new Date(),
  ): Promise<OrgEmailDomainDailyStats> {
    const domain = await this.db.query.orgEmailDomainsTable.findFirst({
      where: eq(orgEmailDomainsTable.id, domainId),
    });

    if (!domain) {
      throw new Error(`Domain not found: ${domainId}`);
    }

    const dateStr = this.getUtcDateString(date);

    // Handle warm-up period - set firstEmailSentAt if this is the first email
    if (!domain.firstEmailSentAt) {
      await this.db
        .update(orgEmailDomainsTable)
        .set({ firstEmailSentAt: date })
        .where(eq(orgEmailDomainsTable.id, domainId));
    }

    // Check if warm-up should be completed
    const warmupPeriodDays = this.getWarmupPeriodDays();
    if (domain.firstEmailSentAt && !domain.warmupCompletedAt) {
      const warmupEndDate = new Date(domain.firstEmailSentAt);
      warmupEndDate.setDate(warmupEndDate.getDate() + warmupPeriodDays);

      if (new Date() >= warmupEndDate) {
        await this.db
          .update(orgEmailDomainsTable)
          .set({ warmupCompletedAt: new Date() })
          .where(eq(orgEmailDomainsTable.id, domainId));
      }
    }

    // Get or create daily stats
    let stats = await this.db.query.orgEmailDomainDailyStatsTable.findFirst({
      where: and(
        eq(orgEmailDomainDailyStatsTable.orgEmailDomainId, domainId),
        eq(orgEmailDomainDailyStatsTable.date, dateStr),
      ),
    });

    if (!stats) {
      // Create new stats record for today
      const records = await this.db
        .insert(orgEmailDomainDailyStatsTable)
        .values({
          orgEmailDomainId: domainId,
          organizationId: domain.organizationId ?? '',
          date: dateStr,
          sentCount: 1,
        })
        .returning();
      stats = records[0];
      if (!stats) {
        throw new Error('Failed to create daily stats record');
      }
      return stats;
    }

    // Increment sent count atomically
    const [updated] = await this.db
      .update(orgEmailDomainDailyStatsTable)
      .set({
        sentCount: sql`${orgEmailDomainDailyStatsTable.sentCount} + 1`,
      })
      .where(
        and(
          eq(orgEmailDomainDailyStatsTable.id, stats.id),
          // Check that we haven't exceeded the limit
          lt(
            orgEmailDomainDailyStatsTable.sentCount,
            domain.dailyLimit ?? this.getDailyLimit(),
          ),
        ),
      )
      .returning();

    if (!updated) {
      throw new Error(
        `Daily send limit reached for domain ${domainId} on ${dateStr}`,
      );
    }

    return updated;
  }

  /**
   * Get the daily limit for email sending
   * - Development: 10 per day
   * - Production: 500 per day
   * Can be overridden via WARMUP_DAILY_LIMIT env var
   */
  private getDailyLimit(): number {
    const envLimit = this.configService.get<string>(WARMUP_DAILY_LIMIT);
    if (envLimit) {
      const parsed = parseInt(envLimit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }

    const isDev = this.configService.get('NODE_ENV') === 'development';
    return isDev ? 10 : 500;
  }

  /**
   * Get the UTC date string for a given date (or today)
   */
  private getUtcDateString(date: Date = new Date()): string {
    return date.toISOString().split('T')[0] ?? '';
  }

  /**
   * Get the warm-up period in days
   * Default: 7 days
   * Can be overridden via WARMUP_PERIOD_DAYS env var
   */
  private getWarmupPeriodDays(): number {
    const envDays = this.configService.get<string>(WARMUP_PERIOD_DAYS);
    if (envDays) {
      const parsed = parseInt(envDays, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 7;
  }
}
