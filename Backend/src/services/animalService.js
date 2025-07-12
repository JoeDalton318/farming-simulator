const { Animal, StorageItem, Farm, Storage, WaterTank } = require("../models");

class AnimalService {
  static async createAnimal(farmId, type, name) {
    const cost = { cow: 10, sheep: 5, chicken: 1 }[type];
    if (!cost) throw new Error("Invalid animal type");

    const farm = await Farm.findByPk(farmId);
    if (farm.money < cost) throw new Error("Not enough money");

    // Configurer les taux de consommation selon le type
    const consumptionRates = {
      cow: { water: 3, grass: 3, production: 20 },
      sheep: { water: 2, grass: 2, production: 5 },
      chicken: { water: 1, grass: 1, production: 1 }
    };

    const animal = await Animal.create({
      type,
      name,
      FarmId: farmId,
      waterConsumption: consumptionRates[type].water,
      grassConsumption: consumptionRates[type].grass,
      productionRate: consumptionRates[type].production,
    });

    farm.money -= cost;
    await farm.save();

    return animal;
  }

  static async feedAnimal(animalId, grassAmount) {
    const animal = await Animal.findByPk(animalId);
    if (!animal) throw new Error("Animal not found");
    return animal.feed(grassAmount);
  }

  static async collectProducts(animalId, waterTankId) {
    const animal = await Animal.findByPk(animalId);
    const [waterTank, storage] = await Promise.all([
      WaterTank.findByPk(waterTankId),
      Storage.findOne({ where: { FarmId: animal.FarmId } })
    ]);

    if (!animal) throw new Error("Animal not found");
    if (!animal.isAlive) throw new Error("Animal is dead");
    if (!waterTank || !storage) throw new Error("Water tank or storage not found");

    // Vérifier l'eau disponible
    if (waterTank.currentLevel < animal.waterConsumption) {
      throw new Error("Not enough water for animal");
    }

    // Consommer l'eau
    await waterTank.consume(animal.waterConsumption);

    // Consommer l'herbe
    await animal.consumeGrass();

    // Produire selon le type d'animal
    const production = await animal.produce();
    if (!production) {
      throw new Error("Animal cannot produce (not enough grass or dead)");
    }

    const results = [];
    for (const [product, amount] of Object.entries(production)) {
      // Vérifier la capacité de stockage
      if (storage.currentVolume + amount > storage.capacity) {
        throw new Error("Storage is full, cannot collect products");
      }

      const item = await StorageItem.create({
        StorageId: storage.id,
        itemType: product,
        quantity: amount,
        valuePerUnit: 1,
        sourceId: animal.id,
      });

      // Mettre à jour le volume du stockage
      await storage.update({
        currentVolume: storage.currentVolume + amount
      });

      results.push(item);
    }

    return results;
  }

  // Méthode pour vérifier l'état des animaux
  static async checkAnimalHealth(animalId) {
    const animal = await Animal.findByPk(animalId);
    if (!animal) throw new Error("Animal not found");

    return {
      id: animal.id,
      name: animal.name,
      type: animal.type,
      isAlive: animal.isAlive,
      grassStock: animal.grassStock,
      lastFed: animal.lastFed,
      status: animal.grassStock <= -5 ? "dead" : 
              animal.grassStock < 0 ? "deficit" : 
              animal.grassStock < 5 ? "hungry" : "healthy"
    };
  }

  // Méthode pour nourrir tous les animaux d'une ferme
  static async feedAllAnimals(farmId, grassAmount) {
    const animals = await Animal.findAll({
      where: { FarmId: farmId, isAlive: true }
    });

    const results = [];
    for (const animal of animals) {
      try {
        await animal.feed(grassAmount);
        results.push({ animalId: animal.id, success: true });
      } catch (error) {
        results.push({ animalId: animal.id, success: false, error: error.message });
      }
    }

    return results;
  }
}

module.exports = AnimalService;
