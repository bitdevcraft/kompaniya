import { BadRequestException } from '@nestjs/common';

import { LimitType } from './types';

export class OrganizationLimitExceededException extends BadRequestException {
  constructor(limitType: LimitType, current: number, limit: number) {
    super({
      message: `Organization limit exceeded for ${limitType}`,
      limitType,
      current,
      limit,
      errorCode: 'ORG_LIMIT_EXCEEDED',
    });
  }
}
