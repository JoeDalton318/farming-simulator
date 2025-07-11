const { Animal, StorageItem, Farm } = require("../models");

class AnimalService {
  static async createAnimal(farmId, type, name) {
    const cost = { cow: 10, sheep: 5, chicken: 1 }[type];
    if (!cost) throw new Error("Invalid animal type");

    const farm = await Farm.findByPk(farmId);
    if (farm.money < cost) throw new Error("Not enough money");

    const animal = await Animal.create({
      type,
      name,
      FarmId: farmId,
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

  static async collectProducts(animalId) {
    const animal = await Animal.findByPk(animalId);
    if (!animal) throw new Error("Animal not found");
    if (!animal.isAlive) throw new Error("Animal is dead");

    const productionRates = {
      cow: { milk: 20, manure: 5 },
      sheep: { wool: 5, manure: 5 },
      chicken: { eggs: 1 },
    };

    const products = productionRates[animal.type];
    const results = [];

    for (const [product, amount] of Object.entries(products)) {
      const item = await StorageItem.create({
        type: "animal",
        subtype: product,
        quantity: amount,
        FarmId: animal.FarmId,
        sourceId: animal.id,
      });
      results.push(item);
    }

    return results;
  }
}

module.exports = AnimalService;
