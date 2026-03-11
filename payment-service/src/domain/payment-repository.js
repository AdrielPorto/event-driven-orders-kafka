/**
 * PaymentRepository interface/abstraction
 */
class PaymentRepository {
  async reserveProcessing(payment) {
    throw new Error('Method not implemented');
  }

  async findByOrderId(orderId) {
    throw new Error('Method not implemented');
  }

  async updateStatus(orderId, status) {
    throw new Error('Method not implemented');
  }

  async close() {
    throw new Error('Method not implemented');
  }
}

module.exports = { PaymentRepository };
