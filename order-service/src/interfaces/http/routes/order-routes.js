const { Router } = require('express');

const createOrderRoutes = ({ orderController }) => {
  const router = Router();

  router.post('/orders', orderController.create);
  router.get('/health', orderController.health);

  return router;
};

module.exports = { createOrderRoutes };
