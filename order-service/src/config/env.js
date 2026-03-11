const parseBrokers = (value) =>
  value
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

const env = Object.freeze({
  port: Number(process.env.PORT || 3000),
  kafkaClientId: process.env.KAFKA_CLIENT_ID || 'order-service',
  kafkaBrokers: parseBrokers(process.env.KAFKA_BROKERS || '127.0.0.1:9092'),
  orderCreatedTopic: process.env.ORDER_CREATED_TOPIC || 'order-created',
});

module.exports = { env };
