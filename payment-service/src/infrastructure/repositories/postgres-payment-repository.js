const { Pool } = require('pg');
const { PaymentRepository } = require('../../domain/payment-repository');
const env = require('../../config/env');

class PostgresPaymentRepository extends PaymentRepository {
  constructor() {
    super();
    this.pool = new Pool(env.database);
  }

  async reserveProcessing(payment) {
    const query = `
      INSERT INTO payments (order_id, amount, status, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (order_id) DO NOTHING
      RETURNING *;
    `;
    const values = [payment.orderId, payment.amount, 'PROCESSING'];

    const { rows } = await this.pool.query(query, values);
    if (rows.length > 0) {
      return { created: true, payment: this.mapToDomain(rows[0]) };
    }

    const existingPayment = await this.findByOrderId(payment.orderId);
    return { created: false, payment: existingPayment };
  }

  async findByOrderId(orderId) {
    const query = 'SELECT * FROM payments WHERE order_id = $1';
    const { rows } = await this.pool.query(query, [orderId]);

    if (rows.length === 0) {
      return null;
    }

    return this.mapToDomain(rows[0]);
  }

  async updateStatus(orderId, status) {
    const query = `
      UPDATE payments 
      SET status = $1, updated_at = NOW() 
      WHERE order_id = $2 
      RETURNING *;
    `;
    const { rows } = await this.pool.query(query, [status, orderId]);

    if (rows.length === 0) {
      throw new Error(`Payment for order ${orderId} not found`);
    }

    return this.mapToDomain(rows[0]);
  }

  mapToDomain(raw) {
    return {
      orderId: raw.order_id,
      amount: parseFloat(raw.amount),
      status: raw.status,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = { PostgresPaymentRepository };
