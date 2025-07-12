const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Field = sequelize.define(
    "Field",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
          max: 99,
        },
      },
      state: {
        type: DataTypes.ENUM(
          "harvested",
          "plowed",
          "seeded",
          "fertilized",
          "ready_to_harvest"
        ),
        defaultValue: "harvested",
      },
      cropType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      batch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fertilized: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // Ajout des champs pour le suivi temporel
      lastActionTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Nouveau champ pour le rendement (peut être calculé ou stocké)
      expectedYield: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      irrigationLevel: {
        // Nouveau champ du patch
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["FarmId", "number"]
        }
      ]
    }
  );

  Field.associate = function (models) {
    this.belongsTo(models.Farm, {
      foreignKey: "FarmId",
      as: "farm",
    });
    this.hasMany(models.FieldHistory, {
      foreignKey: "FieldId",
      as: "history",
    });
    this.belongsTo(models.Crop, {
      foreignKey: "CropId",
      as: "crop",
    });
  };

  // Méthode pour l'irrigation (nouveau du patch)
  Field.prototype.irrigate = async function (waterAmount) {
    this.irrigationLevel = Math.min(100, this.irrigationLevel + waterAmount);
    await this.createHistory({
      action: "irrigate",
      details: { amount: waterAmount },
    });
    return this.save();
  };

  return Field;
};
