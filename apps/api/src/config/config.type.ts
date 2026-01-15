export const DATABASE_URL = 'DATABASE_URL';
export const REDIS_URL = 'REDIS_URL';
export const AWS_REGION = 'AWS_REGION';
export const AWS_ACCESS_KEY_ID = 'AWS_ACCESS_KEY_ID';
export const AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_ACCESS_KEY';
export const WARMUP_DAILY_LIMIT = 'WARMUP_DAILY_LIMIT';
export const WARMUP_PERIOD_DAYS = 'WARMUP_PERIOD_DAYS';

export interface EnvironmentType {
  [DATABASE_URL]?: string;
  [REDIS_URL]?: string;
  [AWS_REGION]?: string;
  [AWS_ACCESS_KEY_ID]?: string;
  [AWS_SECRET_ACCESS_KEY]?: string;
  [WARMUP_DAILY_LIMIT]?: string;
  [WARMUP_PERIOD_DAYS]?: string;
}
