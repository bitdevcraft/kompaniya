import { Inject, Injectable } from '@nestjs/common';
import { Cacheable } from 'cacheable';

import { CACHE_INSTANCE } from '~/constants/provider';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_INSTANCE) private readonly cache: Cacheable) {}

  async delete(key: string): Promise<void> {
    await this.cache.delete(key);
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const v = await this.cache.get(key);
    return v as T | undefined;
  }

  async set<T = unknown>(
    key: string,
    value: T,
    ttl?: number | string,
  ): Promise<void> {
    await this.cache.set(key, value, ttl);
  }

  async wrapCache<T = unknown>(options: {
    key: string;
    fn: () => Promise<T>;
    ttl?: number | string;
  }): Promise<T | undefined> {
    const { key, fn, ttl } = options;

    const cached = await this.cache.get<T>(key);

    if (cached) {
      return cached;
    }

    const recent = await fn();

    if (recent) {
      await this.cache.set<T>(key, recent, ttl);
    }

    return recent;
  }
}
