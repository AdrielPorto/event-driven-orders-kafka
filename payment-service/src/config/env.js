require('dotenv').config();

const parseBrokers = (value) =>
  value
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

module.exports = Object.freeze({
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'payment-service',
    brokers: parseBrokers(
      process.env.KAFKA_BROKERS || process.env.KAFKA_BROKER || 'localhost:9092'
    ),
    groupId: process.env.KAFKA_GROUP_ID || 'payment-consumer-group',
    topics: {
      orderCreated: process.env.ORDER_CREATED_TOPIC || 'order-created',
    },
  },
});
