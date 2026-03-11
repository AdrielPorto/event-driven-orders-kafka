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
      paymentStatus: process.env.PAYMENT_STATUS_TOPIC || 'payment-status',
      paymentFailedDlq: process.env.PAYMENT_FAILED_DLQ_TOPIC || 'payment-failed-dlq',
    },
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'orders_db',
  },
});
