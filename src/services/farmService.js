const { sequelize, Farm, Storage, Transaction, Factory } = require("../models");
const EquipmentService = require("./equipmentService");

class FarmService {
  static async createFarm() {
    const transaction = await sequelize.transaction();
    try {
      const farm = await Farm.create({
        name: "New Farm",
        money: 10000 // Capital initial
      }, { transaction });

      // Créer le stockage associé
      await Storage.create({
        FarmId: farm.id,
        capacity: process.env.STORAGE_CAPACITY || 100000,
        currentVolume: 0
      }, { transaction });

      // Créer les usines de base
      const factories = await Factory.bulkCreate([
        { type: 'oil_mill', FarmId: farm.id, processingRate: 100 },
        { type: 'sawmill', FarmId: farm.id, processingRate: 100 },
        { type: 'bakery', FarmId: farm.id, processingRate: 50 }
      ], { transaction });

      // Initialiser les équipements
      await EquipmentService.initializeFarmEquipment(farm.id, { transaction });

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
        transaction
      });

      if (!farm) throw new Error("Farm not found");
      if (!farm.Storage) throw new Error("Storage not found");

      const result = await farm.Storage.sellItem(itemId, quantity, { transaction });

      // Mettre à jour l'argent de la ferme
      farm.money = (farm.money || 0) + result.totalValue;
      await farm.save({ transaction });

      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getFarmStatus(farmId) {
    const farm = await Farm.findByPk(farmId, {
      include: [
        { model: Storage, include: ['items'] },
        { model: Factory },
        { model: Field }
      ]
    });

    if (!farm) throw new Error("Farm not found");

    return {
      id: farm.id,
      name: farm.name,
      money: farm.money,
      storage: {
        capacity: farm.Storage.capacity,
        used: farm.Storage.currentVolume,
        items: farm.Storage.items
      },
      factories: farm.Factories,
      fields: farm.Fields
    };
  }

  static async getFinancialReport(farmId) {
    const transactions = await Transaction.findAll({
      where: { FarmId: farmId },
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const totalValue = transactions.reduce((sum, t) => sum + t.totalValue, 0);

    return {
      transactions,
      totalValue,
      transactionCount: transactions.length
    };
  }
}

module.exports = FarmService;