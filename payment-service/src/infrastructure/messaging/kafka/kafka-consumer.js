const { Kafka } = require('kafkajs');

class KafkaConsumer {
  constructor({ clientId, brokers, groupId, logger, paymentProcessor }) {
    this.logger = logger;
    this.paymentProcessor = paymentProcessor;
    this.isConnected = false;

    this.kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.consumer = this.kafka.consumer({ groupId });
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    this.logger.info('Connecting to Kafka (Consumer)');
    await this.consumer.connect();
    this.isConnected = true;
    this.logger.info('Kafka consumer connected');
  }

  async subscribe(topic) {
    await this.consumer.subscribe({ topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: this.handleMessage.bind(this),
    });
  }

  async handleMessage({ topic, partition, message }) {
    const parsedPayload = this.parseMessage(message, topic);
    if (!parsedPayload) {
      return;
    }

    try {
      const result = await this.paymentProcessor.processPayment(parsedPayload.id, parsedPayload.amount);
      this.logger.info('Message processed successfully', {
        topic,
        partition,
        orderId: result.orderId,
        status: result.status,
      });
    } catch (error) {
      this.logger.error('Error processing message', {
        topic,
        partition,
        orderId: parsedPayload.id,
        message: error.message,
      });
      throw error;
    }
  }

  parseMessage(message, topic) {
    try {
      const payload = JSON.parse(message.value.toString());
      this.logger.info(`Received message on topic ${topic}`, {
        key: message.key?.toString() || null,
      });
      return payload;
    } catch (error) {
      this.logger.error('Invalid message payload', {
        topic,
        message: error.message,
      });
      return null;
    }
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    await this.consumer.disconnect();
    this.isConnected = false;
    this.logger.info('Kafka consumer disconnected');
  }
}

module.exports = { KafkaConsumer };
