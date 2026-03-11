const express = require('express');
const { CreateOrderUseCase } = require('./application/use-cases/create-order-use-case');
const { KafkaEventPublisher } = require('./infrastructure/messaging/kafka/kafka-event-publisher');
const { OrderController } = require('./interfaces/http/controllers/order-controller');
const { createOrderRoutes } = require('./interfaces/http/routes/order-routes');
const { createLogger } = require('./shared/logger');

const createApp = ({ envConfig, logger = createLogger('order-service') }) => {
  const eventPublisher = new KafkaEventPublisher({
    clientId: envConfig.kafkaClientId,
    brokers: envConfig.kafkaBrokers,
    logger,
  });

  const createOrderUseCase = new CreateOrderUseCase({
    eventPublisher,
    topic: envConfig.orderCreatedTopic,
  });

  const orderController = new OrderController({
    createOrderUseCase,
    logger,
  });

  const app = express();
  app.use(express.json());
  app.use(createOrderRoutes({ orderController }));

  return {
    app,
    port: envConfig.port,
    dependencies: {
      eventPublisher,
    },
  };
};

module.exports = { createApp };
