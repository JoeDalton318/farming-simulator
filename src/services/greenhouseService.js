const { Greenhouse, StorageItem, Farm } = require("../models");

class GreenhouseService {
  static async createGreenhouse(farmId) {
    const farm = await Farm.findByPk(farmId);
    if (!farm) throw new Error("Farm not found");

    return Greenhouse.create({
      FarmId: farmId,
      isActive: false,
    });
  }

  static async activateGreenhouse(greenhouseId, waterTankId) {
    const greenhouse = await Greenhouse.findByPk(greenhouseId);
    const waterTank = await waterTank.findByPk(waterTankId);

    if (!greenhouse || !waterTank) {
      throw new Error("Greenhouse or water tank not found");
    }

    greenhouse.isActive = true;
    await greenhouse.save();

    return greenhouse;
  }

  static async produceStrawberries(greenhouseId) {
    const greenhouse = await Greenhouse.findByPk(greenhouseId);
    if (!greenhouse) throw new Error("Greenhouse not found");
    if (!greenhouse.isActive) throw new Error("Greenhouse is not active");

    const production = await greenhouse.produce();
    await StorageItem.create({
      type: "special",
      subtype: "strawberry",
      quantity: production.amount,
      FarmId: greenhouse.FarmId,
      sourceId: greenhouse.id,
    });

    return production;
  }
}

module.exports = GreenhouseService;
