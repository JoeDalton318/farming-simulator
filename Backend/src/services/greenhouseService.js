const { Greenhouse, StorageItem, Farm, WaterTank, Storage } = require("../models");

class GreenhouseService {
  static async createGreenhouse(farmId) {
    const farm = await Farm.findByPk(farmId);
    if (!farm) throw new Error("Farm not found");

    return Greenhouse.create({
      FarmId: farmId,
      isActive: false,
      waterConsumptionRate: 15, // 15 L/s selon le patch
    });
  }

  static async activateGreenhouse(greenhouseId, waterTankId) {
    const [greenhouse, waterTank] = await Promise.all([
      Greenhouse.findByPk(greenhouseId),
      WaterTank.findByPk(waterTankId)
    ]);

    if (!greenhouse || !waterTank) {
      throw new Error("Greenhouse or water tank not found");
    }

    // Vérifier que le réservoir d'eau a assez d'eau
    if (waterTank.currentLevel < greenhouse.waterConsumptionRate) {
      throw new Error("Not enough water in tank to activate greenhouse");
    }

    greenhouse.isActive = true;
    await greenhouse.save();

    return greenhouse;
  }

  static async produceStrawberries(greenhouseId, waterTankId) {
    const greenhouse = await Greenhouse.findByPk(greenhouseId);
    const [waterTank, storage] = await Promise.all([
      WaterTank.findByPk(waterTankId),
      Storage.findOne({ where: { FarmId: greenhouse.FarmId } })
    ]);

    if (!greenhouse || !waterTank || !storage) {
      throw new Error("Greenhouse, water tank or storage not found");
    }

    if (!greenhouse.isActive) {
      throw new Error("Greenhouse is not active");
    }

    // Vérifier l'eau disponible
    if (waterTank.currentLevel < greenhouse.waterConsumptionRate) {
      throw new Error("Not enough water for production");
    }

    // Consommer l'eau
    await waterTank.consume(greenhouse.waterConsumptionRate);

    // Produire des fraises (1500L toutes les 5 minutes selon le patch)
    const productionAmount = 1500;

    // Vérifier la capacité de stockage
    if (storage.currentVolume + productionAmount > storage.capacity) {
      throw new Error("Storage is full, cannot produce");
    }

    // Créer l'item de stockage
    await StorageItem.create({
      StorageId: storage.id,
      itemType: "strawberry",
      quantity: productionAmount,
      valuePerUnit: 1,
      sourceId: greenhouse.id,
    });

    // Mettre à jour le volume du stockage
    await storage.update({
      currentVolume: storage.currentVolume + productionAmount
    });

    return {
      success: true,
      amount: productionAmount,
      waterConsumed: greenhouse.waterConsumptionRate
    };
  }

  // Méthode pour vérifier si la serre peut produire
  static async canProduce(greenhouseId, waterTankId) {
    const [greenhouse, waterTank, storage] = await Promise.all([
      Greenhouse.findByPk(greenhouseId),
      WaterTank.findByPk(waterTankId),
      Storage.findOne({ where: { FarmId: greenhouse.FarmId } })
    ]);

    if (!greenhouse || !waterTank || !storage) {
      return { canProduce: false, reason: "Missing components" };
    }

    const hasWater = waterTank.currentLevel >= greenhouse.waterConsumptionRate;
    const hasStorage = storage.currentVolume + 1500 <= storage.capacity;
    const isActive = greenhouse.isActive;

    return {
      canProduce: hasWater && hasStorage && isActive,
      hasWater,
      hasStorage,
      isActive,
      waterNeeded: greenhouse.waterConsumptionRate,
      storageNeeded: 1500
    };
  }
}

module.exports = GreenhouseService;
