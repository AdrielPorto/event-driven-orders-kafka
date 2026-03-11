const { ValidationError } = require('../errors/validation-error');
const { buildOrderEvent } = require('../../domain/order/order-entity');

class CreateOrderUseCase {
  constructor({
    eventPublisher,
    topic,
    now = () => new Date().toISOString(),
    nextId = () => `ord_${Date.now()}`,
  }) {
    this.eventPublisher = eventPublisher;
    this.topic = topic;
    this.now = now;
    this.nextId = nextId;
  }

  async execute(orderData) {
    this.validate(orderData);

    const orderId = orderData.id || this.nextId();
    const eventPayload = buildOrderEvent({
      orderData,
      orderId,
      createdAt: this.now(),
    });

    await this.eventPublisher.publish({
      topic: this.topic,
      key: String(orderId),
      payload: eventPayload,
    });

    return {
      message: 'Order received and being processed asynchronously',
      orderId: eventPayload.id,
      status: 'PENDING_PAYMENT',
    };
  }

  validate(orderData) {
    const isObject =
      typeof orderData === 'object' &&
      orderData !== null &&
      !Array.isArray(orderData);

    if (!isObject || Object.keys(orderData).length === 0) {
      throw new ValidationError('Order data is required');
    }
  }
}

module.exports = { CreateOrderUseCase };
