const env = require('./config/env');
const { KafkaConsumer } = require('./infrastructure/messaging/kafka/kafka-consumer');
const { PaymentProcessor } = require('./application/payment-processor');
const { createLogger } = require('./shared/logger');

const logger = createLogger('payment-service');

async function start() {
  const paymentProcessor = new PaymentProcessor({ logger });

  const kafkaConsumer = new KafkaConsumer({
    clientId: env.kafka.clientId,
    brokers: env.kafka.brokers,
    groupId: env.kafka.groupId,
    logger,
    paymentProcessor,
  });

  try {
    await kafkaConsumer.connect();
    await kafkaConsumer.subscribe(env.kafka.topics.orderCreated);
    logger.info('Payment service is running', {
      topic: env.kafka.topics.orderCreated,
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      await kafkaConsumer.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error('Failed to start Payment service', { message: error.message });
    process.exit(1);
  }
}

start();
