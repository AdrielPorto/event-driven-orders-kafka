class PaymentProcessor {
  constructor({
    logger,
    paymentRepository,
    failureRate = 0.3,
    random = Math.random,
  }) {
    this.logger = logger;
    this.paymentRepository = paymentRepository;
    this.failureRate = failureRate;
    this.random = random;
  }

  async processPayment(orderId, amount) {
    if (!orderId) {
      return {
        success: false,
        orderId: null,
        status: 'FAILED',
        shouldSendToDlq: true,
        errorMessage: 'orderId is required to process payment',
      };
    }

    const parsedAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
    const reservation = await this.paymentRepository.reserveProcessing({
      orderId,
      amount: parsedAmount,
    });

    if (!reservation.created) {
      this.logger.info('Skipping duplicated order processing', {
        orderId,
        currentStatus: reservation.payment?.status || 'UNKNOWN',
      });
      return {
        success: true,
        orderId,
        status: reservation.payment?.status || 'UNKNOWN',
        duplicated: true,
        shouldSendToDlq: false,
      };
    }

    this.logger.info('Starting payment processing', {
      orderId,
      amount: parsedAmount,
    });

    try {
      // Simulate payment processing delay of 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (this.random() < this.failureRate) {
        throw new Error('Simulated random payment failure');
      }

      await this.paymentRepository.updateStatus(orderId, 'APPROVED');
      this.logger.info('Payment approved', { orderId });

      return {
        success: true,
        orderId,
        status: 'APPROVED',
        shouldSendToDlq: false,
      };
    } catch (error) {
      this.logger.error('Error processing payment', {
        orderId,
        message: error.message,
      });
      await this.paymentRepository.updateStatus(orderId, 'FAILED');
      return {
        success: false,
        orderId,
        status: 'FAILED',
        shouldSendToDlq: true,
        errorMessage: error.message,
      };
    }
  }
}

module.exports = { PaymentProcessor };
