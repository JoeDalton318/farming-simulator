const { WaterTank, Farm } = require("../models");
const { Op } = require("sequelize");

class WaterService {
  static async createWaterTank(farmId) {
    return WaterTank.create({
      FarmId: farmId,
      currentLevel: 20000,
      capacity: 20000,
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
    return {
      currentLevel: tank.currentLevel,
      capacity: tank.capacity,
      percentage: Math.round((tank.currentLevel / tank.capacity) * 100),
      lastRefill: tank.lastRefillTime
    };
  }

  // Nouvelle méthode pour la recharge automatique toutes les 5 minutes
  static async autoRefillWaterTanks() {
    const tanks = await WaterTank.findAll({
      where: {
        lastRefillTime: {
          [Op.lt]: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
        }
      }
    });

    for (const tank of tanks) {
      await tank.refill();
    }

    return tanks.length;
  }

  // Méthode pour vérifier si un tank peut consommer de l'eau
  static async canConsumeWater(tankId, amount) {
    const tank = await WaterTank.findByPk(tankId);
    if (!tank) throw new Error("Water tank not found");
    
    return {
      canConsume: tank.currentLevel >= amount,
      available: tank.currentLevel,
      required: amount
    };
  }
}

module.exports = WaterService;
