const env = require('./config/env');
const { KafkaConsumer } = require('./infrastructure/messaging/kafka/kafka-consumer');
const { KafkaProducer } = require('./infrastructure/messaging/kafka/kafka-producer');
const { PaymentProcessor } = require('./application/payment-processor');
const { PostgresPaymentRepository } = require('./infrastructure/repositories/postgres-payment-repository');
const { initDb } = require('./infrastructure/database/init');
const { createLogger } = require('./shared/logger');

const logger = createLogger('payment-service');

async function start() {
  let paymentRepository;
  let kafkaConsumer;
  let dlqProducer;

  try {
    await initDb();

    paymentRepository = new PostgresPaymentRepository();
    const paymentProcessor = new PaymentProcessor({
      logger,
      paymentRepository,
      failureRate: env.payment.failureRate,
    });

    dlqProducer = new KafkaProducer({
      clientId: `${env.kafka.clientId}-dlq-producer`,
      brokers: env.kafka.brokers,
      logger,
    });

    await dlqProducer.connect();

    kafkaConsumer = new KafkaConsumer({
      clientId: env.kafka.clientId,
      brokers: env.kafka.brokers,
      groupId: env.kafka.groupId,
      logger,
      paymentProcessor,
      dlqPublisher: dlqProducer,
      dlqTopic: env.kafka.topics.paymentFailedDlq,
    });

    await kafkaConsumer.connect();
    await kafkaConsumer.subscribe(env.kafka.topics.orderCreated);
    logger.info('Payment service is running', {
      topic: env.kafka.topics.orderCreated,
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      await kafkaConsumer.disconnect();
      await dlqProducer.disconnect();
      await paymentRepository.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error('Failed to start Payment service', { message: error.message });
    if (kafkaConsumer) {
      await kafkaConsumer.disconnect().catch(() => {});
    }
    if (dlqProducer) {
      await dlqProducer.disconnect().catch(() => {});
    }
    if (paymentRepository) {
      await paymentRepository.close().catch(() => {});
    }
    process.exit(1);
  }
}

start().catch((error) => {
  logger.error('Unhandled startup error', { message: error.message });
  process.exit(1);
});
