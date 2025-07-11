const { WaterTank } = require("../models");

class WaterService {
  static async createWaterTank(farmId) {
    return WaterTank.create({
      FarmId: farmId,
      currentLevel: 20000,
    });
  }

  static async refillWaterTank(tankId) {
    const tank = await WaterTank.findByPk(tankId);
    if (!tank) throw new Error("Water tank not found");
    return tank.refill();
  }

  static async consumeWater(tankId, amount) {
    const tank = await WaterTank.findByPk(tankId);
    if (!tank) throw new Error("Water tank not found");
    return tank.consume(amount);
  }

  static async getWaterLevel(tankId) {
    const tank = await WaterTank.findByPk(tankId);
    if (!tank) throw new Error("Water tank not found");
    return tank.currentLevel;
  }
}

module.exports = WaterService;
