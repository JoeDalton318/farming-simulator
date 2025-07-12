// models/warehouse.js
module.exports = (sequelize, DataTypes) => {
  const Warehouse = sequelize.define(
    "Warehouse",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: "Entrepôt Principal",
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50000, // 50 000L comme spécifié dans le patch
        validate: {
          min: 0,
        },
      },
      currentVolume: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      temperature: {
        // Pour les produits sensibles
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      type: {
        // Pour classification (produits animaux, transformés, etc.)
        type: DataTypes.ENUM(
          "processed",
          "animal_products",
          "cold_storage",
          "general"
        ),
        defaultValue: "processed",
      },
    },
    {
      timestamps: true,
      paranoid: true, // Activation du soft delete
      indexes: [
        {
          fields: ["FarmId"], // Index pour les jointures fréquentes
        },
        {
          fields: ["type"],
        },
      ],
    }
  );

  Warehouse.associate = function (models) {
    // Association avec la ferme
    this.belongsTo(models.Farm, {
      foreignKey: {
        name: "FarmId",
        allowNull: false,
      },
      onDelete: "CASCADE",
    });

    // Association avec les items stockés
    this.hasMany(models.StorageItem, {
      foreignKey: "WarehouseId",
      as: "items",
      constraints: false,
      scope: {
        storageType: "warehouse",
      },
    });

    // Association avec les usines (pour livraison directe)
    this.hasMany(models.Factory, {
      foreignKey: "WarehouseId",
      as: "servedFactories",
    });
  };

  // ===== MÉTHODES D'INSTANCE ===== //

  /**
   * Vérifie si l'entrepôt peut accepter une quantité supplémentaire
   * @param {number} amount - Quantité à ajouter
   * @returns {boolean}
   */
  Warehouse.prototype.canAccept = function (amount) {
    return this.currentVolume + amount <= this.capacity;
  };

  /**
   * Ajoute du volume à l'entrepôt
   * @param {number} amount - Quantité à ajouter
   * @returns {Promise<Warehouse>}
   */
  Warehouse.prototype.addVolume = async function (amount) {
    if (!this.canAccept(amount)) {
      throw new Error("Capacité de l'entrepôt dépassée");
    }
    this.currentVolume += amount;
    return this.save();
  };

  /**
   * Retire du volume de l'entrepôt
   * @param {number} amount - Quantité à retirer
   * @returns {Promise<Warehouse>}
   */
  Warehouse.prototype.removeVolume = async function (amount) {
    if (this.currentVolume < amount) {
      throw new Error("Stock insuffisant dans l'entrepôt");
    }
    this.currentVolume -= amount;
    return this.save();
  };

  // ===== HOOKS ===== //

  // Vérification avant sauvegarde
  Warehouse.beforeSave((warehouse) => {
    if (warehouse.currentVolume > warehouse.capacity) {
      throw new Error("Le volume actuel ne peut pas dépasser la capacité");
    }
  });

  return Warehouse;
};
