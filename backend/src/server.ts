import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { logger } from './utils/logger';

async function bootstrap() {
  try {
    // 1. Database connection
    await connectDatabase();

    // 2. Redis connection (optional/graceful fallback)
    try {
      await connectRedis();
    } catch {
      logger.warn('Running without active Redis instance');
    }

    // 3. Start server
    const server = app.listen(env.PORT, () => {
      logger.info(`✨ LUMORA Luxury Perfume API Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`🔗 API Base URL: http://localhost:${env.PORT}/api/v1`);
      logger.info(`🩺 Health Check: http://localhost:${env.PORT}/health`);
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Initiating graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed');
        await disconnectDatabase();
        await disconnectRedis();
        logger.info('Process terminated gracefully');
        process.exit(0);
      });

      // Force exit after 10s if graceful shutdown hangs
      setTimeout(() => {
        logger.error('Forced shutdown timeout reached');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal(error, 'Failed to start server');
    process.exit(1);
  }
}

bootstrap();
