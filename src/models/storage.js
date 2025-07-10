module.exports = (sequelize, DataTypes) => {
  const Storage = sequelize.define("Storage", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 100000,
      validate: {
        min: 0,
      },
    },
    currentVolume: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    isFull: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.currentVolume >= this.capacity;
      },
    },
  });

  Storage.associate = (models) => {
    Storage.belongsTo(models.Farm);
    Storage.hasMany(models.StorageItem);
    Storage.hasMany(models.StorageAlert);
  };

  // Méthode pour vendre des items
  Storage.prototype.sellItem = async function (itemId, quantity, options = {}) {
    const { transaction } = options;
    const { StorageItem, Transaction } = this.sequelize.models;

    const item = await StorageItem.findByPk(itemId, { transaction });
    if (!item) throw new Error("Item not found");

    if (item.quantity < quantity) {
      throw new Error(
        `Not enough quantity in storage (available: ${item.quantity}, requested: ${quantity})`
      );
    }

    const totalValue = item.valuePerUnit * quantity;

    // Créer la transaction
    await Transaction.create(
      {
        itemType: item.itemType,
        quantity,
        totalValue,
        action: "sell",
        FarmId: this.FarmId,
      },
      { transaction }
    );

    // Mettre à jour le stock
    if (item.quantity === quantity) {
      await item.destroy({ transaction });
    } else {
      item.quantity -= quantity;
      await item.save({ transaction });
    }

    // Mettre à jour le volume du stockage
    this.currentVolume -= quantity;
    await this.save({ transaction });

    return {
      success: true,
      totalValue,
      remainingQuantity: item.quantity === quantity ? 0 : item.quantity,
    };
  };

  return Storage;
};
