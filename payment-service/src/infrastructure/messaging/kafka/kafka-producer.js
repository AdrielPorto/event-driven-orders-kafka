const { Kafka, Partitioners } = require('kafkajs');

class KafkaProducer {
  constructor({ clientId, brokers, logger }) {
    this.logger = logger;
    this.isConnected = false;

    const kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = kafka.producer({
      allowAutoTopicCreation: true,
      createPartitioner: Partitioners.LegacyPartitioner,
      transactionTimeout: 30000,
    });
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    await this.producer.connect();
    this.isConnected = true;
    this.logger.info('Kafka producer connected');
  }

  async publish({ topic, key, payload }) {
    if (!this.isConnected) {
      throw new Error('Kafka producer is not connected');
    }

    await this.producer.send({
      topic,
      messages: [
        {
          key,
          value: JSON.stringify(payload),
        },
      ],
    });
  }

  async disconnect() {
    if (!this.isConnected) {
      return;
    }

    await this.producer.disconnect();
    this.isConnected = false;
    this.logger.info('Kafka producer disconnected');
  }
}

module.exports = { KafkaProducer };
