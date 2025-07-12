// models/farm.js
module.exports = (sequelize, DataTypes) => {
  const Farm = sequelize.define(
    "Farm",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Ma Ferme",
      },
      money: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 10000,
      },
      waterCapacity: {
        // Nouveau champ du patch
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 20000,
      },
      lastMaintenance: {
        // Pour suivre l'entretien global
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true, // Soft delete
    }
  );

  Farm.associate = function (models) {
    this.hasMany(models.Field, {
      foreignKey: "FarmId",
      as: "fields",
    });
    this.hasOne(models.Storage, {
      foreignKey: "FarmId",
      as: "mainStorage",
    });
    this.hasOne(models.Warehouse, {
      foreignKey: "FarmId",
      as: "warehouse",
    });
    this.hasOne(models.WaterTank, {
      foreignKey: "FarmId",
      as: "waterTank",
    });
    this.hasMany(models.Animal, {
      foreignKey: "FarmId",
      as: "animals",
    });
    this.hasMany(models.Factory, {
      foreignKey: "FarmId",
      as: "factories",
    });
  };

  // Méthode pour déduire de l'argent
  Farm.prototype.deductMoney = async function (amount) {
    if (this.money < amount) throw new Error("Fonds insuffisants");
    this.money -= amount;
    return this.save();
  };

  return Farm;
};
