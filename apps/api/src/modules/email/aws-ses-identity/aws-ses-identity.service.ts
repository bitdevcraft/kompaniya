import { SES } from '@aws-sdk/client-ses';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP } from '@repo/shared';
import { convertCase } from '@repo/shared/utils';

import { AWS_REGION } from '~/config/config.type';
import { AWS_SES } from '~/constants/provider';

import type { EmailDomainMetadata } from '../email-domain-verification/email-domain-verification.types';

@Injectable()
export class AwsSesIdentityService {
  constructor(
    @Inject(AWS_SES) private readonly ses: SES,
    private readonly configService: ConfigService,
  ) {}

  async getDkimAttributes(identity: string) {
    const domain = this.extractDomain(identity);
    if (!domain) return null;

    const attributes = await this.ses.getIdentityDkimAttributes({
      Identities: [domain],
    });

    const record = attributes.DkimAttributes?.[domain];

    if (!record) return null;

    return {
      identity: domain,
      tokens: record.DkimTokens ?? [],
      status: record.DkimVerificationStatus,
    };
  }

  async getIdentityVerificationAttributes(identities: string[]) {
    const uniqueIdentities = [...new Set(identities.filter(Boolean))];
    if (uniqueIdentities.length === 0) return null;

    return this.ses.getIdentityVerificationAttributes({
      Identities: uniqueIdentities,
    });
  }

  async verifyDomain(identity: string): Promise<EmailDomainMetadata> {
    const domain = this.extractDomain(identity);
    if (!domain) {
      throw new Error('Domain identity is required for SES verification.');
    }

    const dkimResult = await this.ses.verifyDomainDkim({
      Domain: domain,
    });

    const mailFromPrefix = convertCase(APP.TITLE, 'title', 'kebab');
    const mailFromDomain = `${mailFromPrefix}.${domain}`;

    await this.ses.setIdentityMailFromDomain({
      Identity: domain,
      MailFromDomain: mailFromDomain,
    });

    const tokens = dkimResult.DkimTokens ?? [];
    const region = this.configService.get<string>(AWS_REGION) ?? 'us-east-1';

    const dnsRecords = [
      ...tokens.map((token) => ({
        type: 'CNAME' as const,
        name: `${token}._domainkey.${domain}`,
        value: `${token}.dkim.amazonses.com`,
      })),
      {
        type: 'MX' as const,
        name: mailFromDomain,
        value: `10 feedback-smtp.${region}.amazonses.com`,
        priority: 10,
      },
      {
        type: 'TXT' as const,
        name: mailFromDomain,
        value: 'v=spf1 include:amazonses.com -all',
      },
    ];

    return {
      dkimTokens: tokens,
      mailFromDomain,
      dnsRecords,
    };
  }

  async verifyEmailIdentity(email: string) {
    return this.ses.verifyEmailIdentity({ EmailAddress: email });
  }

  private extractDomain(identity: string) {
    return identity.includes('@') ? (identity.split('@')[1] ?? '') : identity;
  }
}
