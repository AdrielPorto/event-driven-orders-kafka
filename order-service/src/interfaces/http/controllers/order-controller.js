const { ValidationError } = require('../../../application/errors/validation-error');

class OrderController {
  constructor({ createOrderUseCase, logger }) {
    this.createOrderUseCase = createOrderUseCase;
    this.logger = logger;
  }

  create = async (req, res) => {
    try {
      const response = await this.createOrderUseCase.execute(req.body);
      return res.status(201).json(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({ error: error.message });
      }

      this.logger.error('Error processing order request', {
        message: error.message,
      });
      return res
        .status(500)
        .json({ error: 'Internal server error while processing order' });
    }
  };

  health = (req, res) => {
    res.status(200).json({ status: 'UP', service: 'order-service' });
  };
}

module.exports = { OrderController };
