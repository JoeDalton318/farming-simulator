const WaterService = require("../services/waterService");

class WaterController {
  static async getWaterLevel(req, res) {
    try {
      const { tankId } = req.params;
      const level = await WaterService.getWaterLevel(tankId);
      res.json(level);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async refillWaterTank(req, res) {
    try {
      const { tankId } = req.params;
      const tank = await WaterService.refillWaterTank(tankId);
      res.json(tank);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async consumeWater(req, res) {
    try {
      const { tankId } = req.params;
      const { amount } = req.body;
      const remainingLevel = await WaterService.consumeWater(tankId, amount);
      res.json({ remainingLevel });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async autoRefillWaterTanks(req, res) {
    try {
      const refilledCount = await WaterService.autoRefillWaterTanks();
      res.json({ refilledCount });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async createWaterTank(req, res) {
    try {
      const { FarmId, capacity } = req.body;
      const tank = await WaterService.createWaterTank(FarmId, capacity);
      res.status(201).json(tank);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = WaterController; 