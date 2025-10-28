import { SES } from '@aws-sdk/client-ses';
import { Inject, Injectable } from '@nestjs/common';

import { AWS_SES } from '~/constants/provider';

@Injectable()
export class AwsSesIdentityService {
  constructor(@Inject(AWS_SES) private readonly ses: SES) {}

  async getIdentities(identities: string[]) {
    const res = await this.ses.getIdentityVerificationAttributes({
      Identities: identities.flatMap((identity) => {
        const domain = identity.split('@')[1];
        return domain ? [domain] : [];
      }),
    });

    const parsedResult = Object.entries(res.VerificationAttributes ?? {});
    return parsedResult.map((obj) => {
      return { email: obj[0], status: obj[1].VerificationStatus };
    });
  }

  async getIdentityVerificationAttributes(email: string) {
    const attributes = await this.ses.getIdentityDkimAttributes({
      Identities: [email, email.split('@')[1] ?? ''],
    });

    const [attr1] = Object.entries(attributes.DkimAttributes ?? {});

    if (!attr1) return null;

    return {
      email: attr1[0],
      tokens: attr1[1].DkimTokens,
      status: attr1[1].DkimVerificationStatus,
    };
  }

  async verifyIdentity(email: string) {
    const DKIM = await this.ses.verifyDomainDkim({
      Domain: email.includes('@') ? email.split('@')[1] : email,
    });

    await this.ses.setIdentityMailFromDomain({
      Identity: email.includes('@') ? email.split('@')[1] : email,
      MailFromDomain: `pulse.${email.includes('@') ? email.split('@')[1] : email}`,
    });

    return DKIM.DkimTokens;
  }
}
