const GreenhouseService = require("../services/greenhouseService");

class GreenhouseController {
  static async createGreenhouse(req, res, next) {
    try {
      const { farmId } = req.body;
      const greenhouse = await GreenhouseService.createGreenhouse(farmId);
      res.status(201).json({
        success: true,
        data: greenhouse,
        message: "Greenhouse created successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async activateGreenhouse(req, res, next) {
    try {
      const { greenhouseId } = req.params;
      const { waterTankId } = req.body;
      const greenhouse = await GreenhouseService.activateGreenhouse(greenhouseId, waterTankId);
      res.json({
        success: true,
        data: greenhouse,
        message: "Greenhouse activated successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async produceStrawberries(req, res, next) {
    try {
      const { greenhouseId } = req.params;
      const { waterTankId } = req.body;
      const production = await GreenhouseService.produceStrawberries(greenhouseId, waterTankId);
      res.json({
        success: true,
        data: production,
        message: "Strawberries produced successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async canProduce(req, res, next) {
    try {
      const { greenhouseId } = req.params;
      const { waterTankId } = req.query;
      const status = await GreenhouseService.canProduce(greenhouseId, waterTankId);
      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GreenhouseController; 