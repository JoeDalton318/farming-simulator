const { Storage, StorageItem, Transaction, Farm, sequelize } = require("../models");
const { Op } = require("sequelize");

// Implémentation du Singleton + Observer Pattern pour le stockage
class StorageObserver {
  constructor() { this.subscribers = []; }
  subscribe(fn) { this.subscribers.push(fn); }
  unsubscribe(fn) { this.subscribers = this.subscribers.filter(sub => sub !== fn); }
  notify(event, data) { for (const fn of this.subscribers) fn(event, data); }
}

class StorageService {
  constructor() {
    if (!StorageService.instance) {
      this.observer = new StorageObserver();
      StorageService.instance = this;
    }
    return StorageService.instance;
  }

  static getInstance() {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Méthodes d'observation
  subscribe(fn) { this.observer.subscribe(fn); }
  unsubscribe(fn) { this.observer.unsubscribe(fn); }
  notify(event, data) { this.observer.notify(event, data); }

  async getStorageContent(storageId) {
    const storage = await Storage.findByPk(storageId, {
      include: [{
        model: StorageItem,
        as: 'items',
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
      items: storage.items.map(item => ({
        id: item.id,
        type: item.itemType,
        quantity: item.quantity,
        value: item.valuePerUnit
      }))
    };
  }

  async addItem(storageId, itemType, quantity, valuePerUnit = 1) {
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
      this.notify('itemAdded', { storageId, itemType, quantity, valuePerUnit });
      return item;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async removeItem(storageId, itemId, quantity) {
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
      this.notify('itemRemoved', { storageId, itemId, quantity });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async sellItem(storageId, itemId, quantity) {
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
      this.notify('itemSold', { storageId, itemId, quantity, totalValue });
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

  async getAvailableCapacity(storageId) {
    const storage = await Storage.findByPk(storageId);
    if (!storage) throw new Error("Storage not found");

    return {
      capacity: storage.capacity,
      used: storage.currentVolume,
      available: storage.capacity - storage.currentVolume,
      percentageUsed: Math.round((storage.currentVolume / storage.capacity) * 100),
      isFull: storage.currentVolume >= storage.capacity
    };
  }

  // Nouvelle méthode pour vérifier si le stockage peut accepter des produits
  async canAcceptProducts(storageId, quantity) {
    const storage = await Storage.findByPk(storageId);
    if (!storage) throw new Error("Storage not found");

    return {
      canAccept: storage.currentVolume + quantity <= storage.capacity,
      availableSpace: storage.capacity - storage.currentVolume,
      wouldBeFull: storage.currentVolume + quantity >= storage.capacity
    };
  }
}

module.exports = StorageService;