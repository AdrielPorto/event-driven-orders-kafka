class PaymentProcessor {
  constructor({ logger, processingDelayMs = 2000 }) {
    this.logger = logger;
    this.processingDelayMs = processingDelayMs;
  }

  async process(orderEvent) {
    const orderId = orderEvent?.id || 'unknown-order';

    this.logger.info('Starting payment processing', { orderId });

    await new Promise((resolve) => setTimeout(resolve, this.processingDelayMs));

    const result = {
      orderId,
      status: 'APPROVED',
      processedAt: new Date().toISOString(),
    };

    this.logger.info('Payment processing completed', result);
    return result;
  }
}

module.exports = { PaymentProcessor };
