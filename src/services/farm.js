const { sequelize, Farm, Storage } = require("../models");

class FarmService {
  static async createFarm() {
    const transaction = await sequelize.transaction();

    try {
      const farm = await Farm.create({}, { transaction });

      // Créer le stockage associé
      await Storage.create(
        {
          FarmId: farm.id,
          capacity: process.env.STORAGE_CAPACITY || 100000,
        },
        { transaction }
      );

      await transaction.commit();
      return farm;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async sellItem(farmId, itemId, quantity) {
    const transaction = await sequelize.transaction();

    try {
      const farm = await Farm.findByPk(farmId, {
        include: [Storage],
        transaction,
      });

      if (!farm) throw new Error("Farm not found");
      if (!farm.Storage) throw new Error("Storage not found");

      const totalValue = await farm.Storage.sellItem(itemId, quantity);

      // Mettre à jour l'argent de la ferme
      farm.money = (farm.money || 0) + totalValue;
      await farm.save({ transaction });

      await transaction.commit();
      return totalValue;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = FarmService;
