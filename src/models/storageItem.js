// src/models/storageItem.js
module.exports = (sequelize, DataTypes) => {
  const StorageItem = sequelize.define(
    "StorageItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM(
          "crop", // Cultures de base
          "processed", // Produits transformés (huile, farine, etc.)
          "animal", // Produits animaux (lait, laine, etc.)
          "fertilizer", // Fertilisant
          "special" // Produits spéciaux (chocolat, gâteau)
        ),
        allowNull: false,
      },
      subtype: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      storageType: {
        type: DataTypes.ENUM("main", "warehouse"),
        allowNull: false,
        defaultValue: "main",
      },
    },
    {
      timestamps: true,
      paranoid: true, // Soft delete
    }
  );

  StorageItem.associate = (models) => {
    StorageItem.belongsTo(models.Storage, {
      foreignKey: {
        allowNull: false,
      },
    });

    // Optionnel : lien avec les cultures si c'est un produit agricole
    StorageItem.belongsTo(models.Crop, {
      foreignKey: {
        allowNull: true,
      },
    });

    // Optionnel : lien avec les usines si c'est un produit transformé
    StorageItem.belongsTo(models.Factory, {
      foreignKey: {
        allowNull: true,
      },
    });
  };

  // Méthodes d'instance
  StorageItem.prototype.addQuantity = async function (amount) {
    this.quantity += amount;
    return this.save();
  };

  StorageItem.prototype.removeQuantity = async function (amount) {
    if (this.quantity < amount) {
      throw new Error("Quantité insuffisante en stock");
    }
    this.quantity -= amount;
    return this.save();
  };

  return StorageItem;
};
