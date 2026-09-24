import Redis from 'ioredis';
import { env } from './env';
import { logger } from '@utils/logger';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) {
          return null; // Stop retrying
        }
        return times * 500;
      },
      lazyConnect: true,
    });

    redis.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    redis.on('error', (err) => {
      logger.error(err, 'Redis connection error');
    });

    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }
  return redis;
}

export async function connectRedis(): Promise<void> {
  return new Promise<void>((resolve) => {
    try {
      const client = getRedis();
      const timer = setTimeout(() => {
        logger.warn('Redis connection timed out, continuing in offline cache mode');
        resolve();
      }, 1500);

      client
        .connect()
        .then(() => {
          clearTimeout(timer);
          resolve();
        })
        .catch((error) => {
          clearTimeout(timer);
          logger.warn({ err: error.message }, 'Redis unavailable, continuing without cache');
          try { client.disconnect(); } catch {}
          resolve();
        });
    } catch {
      resolve();
    }
  });
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    logger.info('Redis disconnected');
  }
}
