const { createApp } = require('./app');
const { env } = require('./config/env');
const { createLogger } = require('./shared/logger');

const logger = createLogger('order-service');
const { app, dependencies, port } = createApp({ envConfig: env, logger });

let server;

const bootstrap = async () => {
  try {
    await dependencies.eventPublisher.connect();
    server = app.listen(port, '0.0.0.0', () => {
      logger.info(`Order Service running on http://0.0.0.0:${port}`);
    });
  } catch (error) {
    logger.error('Failed to bootstrap server', { message: error.message });
    process.exit(1);
  }
};

const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown.`);
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await dependencies.eventPublisher.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { message: error.message });
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

bootstrap();
