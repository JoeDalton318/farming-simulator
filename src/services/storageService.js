const { Storage, StorageItem, Transaction, Farm, sequelize } = require("../models");
const { Op } = require("sequelize");

class StorageService {
  static async getStorageContent(storageId) {
    const storage = await Storage.findByPk(storageId, {
      include: [{
        model: StorageItem,
        order: [['itemType', 'ASC']]
      }]
    });

    if (!storage) throw new Error("Storage not found");

    return {
      id: storage.id,
      capacity: storage.capacity,
      used: storage.currentVolume,
      available: storage.capacity - storage.currentVolume,
      isFull: storage.currentVolume >= storage.capacity,
      items: storage.StorageItems.map(item => ({
        id: item.id,
        type: item.itemType,
        quantity: item.quantity,
        value: item.valuePerUnit
      }))
    };
  }

  static async addItem(storageId, itemType, quantity, valuePerUnit = 1) {
    const transaction = await sequelize.transaction();
    try {
      const storage = await Storage.findByPk(storageId, { transaction });
      if (!storage) throw new Error("Storage not found");

      // Vérifier la capacité disponible
      const availableSpace = storage.capacity - storage.currentVolume;
      if (quantity > availableSpace) {
        throw new Error(`Only ${availableSpace}L of storage space available`);
      }

      const [item] = await StorageItem.findOrCreate({
        where: { StorageId: storageId, itemType },
        defaults: { quantity: 0, valuePerUnit },
        transaction
      });

      // Mettre à jour la quantité et la valeur
      await item.update({
        quantity: sequelize.literal(`quantity + ${quantity}`),
        valuePerUnit: valuePerUnit // Mise à jour du prix unitaire
      }, { transaction });

      // Mettre à jour le volume du stockage
      await storage.update({
        currentVolume: sequelize.literal(`currentVolume + ${quantity}`)
      }, { transaction });

      await transaction.commit();
      return item;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async removeItem(storageId, itemId, quantity) {
    const transaction = await sequelize.transaction();
    try {
      const [storage, item] = await Promise.all([
        Storage.findByPk(storageId, { transaction }),
        StorageItem.findByPk(itemId, { transaction })
      ]);

      if (!storage) throw new Error("Storage not found");
      if (!item) throw new Error("Item not found");
      if (item.quantity < quantity) {
        throw new Error(`Only ${item.quantity}L available, requested ${quantity}L`);
      }

      // Mettre à jour ou supprimer l'item
      if (item.quantity === quantity) {
        await item.destroy({ transaction });
      } else {
        await item.update({
          quantity: sequelize.literal(`quantity - ${quantity}`)
        }, { transaction });
      }

      // Mettre à jour le volume du stockage
      await storage.update({
        currentVolume: sequelize.literal(`currentVolume - ${quantity}`)
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async sellItem(storageId, itemId, quantity) {
    const transaction = await sequelize.transaction();
    try {
      const [storage, item, farm] = await Promise.all([
        Storage.findByPk(storageId, { 
          include: [Farm],
          transaction 
        }),
        StorageItem.findByPk(itemId, { transaction }),
        Storage.findByPk(storageId, {
          include: [{
            model: Farm,
            required: true
          }],
          transaction
        }).then(s => s?.Farm)
      ]);

      if (!storage) throw new Error("Storage not found");
      if (!item) throw new Error("Item not found");
      if (!farm) throw new Error("Farm not found");
      if (item.quantity < quantity) {
        throw new Error(`Only ${item.quantity}L available, requested ${quantity}L`);
      }

      const totalValue = quantity * item.valuePerUnit;

      // Enregistrer la transaction
      await Transaction.create({
        FarmId: farm.id,
        itemType: item.itemType,
        quantity,
        totalValue,
        action: 'sell'
      }, { transaction });

      // Mettre à jour ou supprimer l'item
      if (item.quantity === quantity) {
        await item.destroy({ transaction });
      } else {
        await item.update({
          quantity: sequelize.literal(`quantity - ${quantity}`)
        }, { transaction });
      }

      // Mettre à jour le volume du stockage et l'argent de la ferme
      await Promise.all([
        storage.update({
          currentVolume: sequelize.literal(`currentVolume - ${quantity}`)
        }, { transaction }),
        farm.update({
          money: sequelize.literal(`money + ${totalValue}`)
        }, { transaction })
      ]);

      await transaction.commit();
      return {
        itemType: item.itemType,
        quantitySold: quantity,
        totalValue,
        remainingQuantity: item.quantity - quantity
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getAvailableCapacity(storageId) {
    const storage = await Storage.findByPk(storageId);
    if (!storage) throw new Error("Storage not found");

    return {
      capacity: storage.capacity,
      used: storage.currentVolume,
      available: storage.capacity - storage.currentVolume,
      percentageUsed: Math.round((storage.currentVolume / storage.capacity) * 100)
    };
  }
}

module.exports = StorageService;