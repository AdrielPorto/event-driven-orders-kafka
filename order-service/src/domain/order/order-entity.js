const ORDER_EVENT_STATUS = 'PENDING';

const buildOrderEvent = ({ orderData, orderId, createdAt }) => ({
  ...orderData,
  id: orderId,
  timestamp: createdAt,
  status: ORDER_EVENT_STATUS,
});

module.exports = {
  ORDER_EVENT_STATUS,
  buildOrderEvent,
};
