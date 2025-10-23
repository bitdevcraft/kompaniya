import { registerAs } from '@nestjs/config';

import { DATABASE_URL, EnvironmentType, REDIS_URL } from './config.type';

export default registerAs(
  'mediamtx',
  (): EnvironmentType => ({
    [DATABASE_URL]: process.env.DATABASE_URL,
    [REDIS_URL]: process.env.REDIS_URL,
  }),
);
