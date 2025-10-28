import { registerAs } from '@nestjs/config';

import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
  DATABASE_URL,
  EnvironmentType,
  REDIS_URL,
} from './config.type';

export default registerAs(
  'mediamtx',
  (): EnvironmentType => ({
    [DATABASE_URL]: process.env.DATABASE_URL,
    [REDIS_URL]: process.env.REDIS_URL,
    [AWS_REGION]: process.env.AWS_REGION,
    [AWS_ACCESS_KEY_ID]: process.env.AWS_ACCESS_KEY_ID,
    [AWS_SECRET_ACCESS_KEY]: process.env.AWS_SECRET_ACCESS_KEY,
  }),
);
