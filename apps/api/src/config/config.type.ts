export const DATABASE_URL = 'DATABASE_URL';
export const REDIS_URL = 'REDIS_URL';

export interface EnvironmentType {
  [DATABASE_URL]?: string;
  [REDIS_URL]?: string;
}
