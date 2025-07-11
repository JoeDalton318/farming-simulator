module.exports = (sequelize, DataTypes) => {
  const Factory = sequelize.define(
    "Factory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.ENUM(
          // Usines de base
          "oil_mill",
          "sawmill",
          "sugar_refinery",
          "spinnery",
          "winery",
          "bakery",
          "chip_factory",
          "toy_factory",
          "wagon_factory",
          "textile_workshop",

          // Nouvelles usines du patch
          "manure_factory",
          "dairy",
          "chocolate_factory",
          "greenhouse",
          "fertilizer_plant"
        ),
        allowNull: false,
      },
      isOperational: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      processingRate: {
        type: DataTypes.INTEGER, // L/sec
        defaultValue: 100,
        validate: {
          min: 1,
        },
      },
      lastMaintenance: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      waterConsumptionRate: {
        // Nouveau champ pour les usines consommatrices d'eau
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      timestamps: true,
      paranoid: true, // Pour le soft delete
    }
  );

  Factory.associate = (models) => {
    Factory.belongsTo(models.Farm);
    Factory.belongsTo(models.Storage); // Lien vers le stockage associé
    Factory.hasMany(models.ProductionLog);
    Factory.hasMany(models.MaintenanceLog);
  };

  // Méthode pour vérifier si l'usine peut traiter certains inputs
  Factory.prototype.checkInputs = function (inputItems) {
    const validInputs = {
      oil_mill: ["sunflower", "olive", "canola"],
      sawmill: ["poplar"],
      sugar_refinery: ["beet", "sugar_cane"],
      spinnery: ["cotton"],
      winery: ["grape"],
      bakery: ["sugar", "flour", "eggs", "butter", "strawberry", "chocolate"],
      chip_factory: ["potato", "oil"],
      toy_factory: ["planks", "fabric"],
      wagon_factory: ["planks"],
      textile_workshop: ["fabric"],
      manure_factory: ["manure"],
      dairy: ["milk"],
      chocolate_factory: ["cacao", "sugar", "milk"],
      fertilizer_plant: ["manure"],
    };

    const requiredInputs = validInputs[this.type] || [];
    return requiredInputs.every((reqInput) =>
      inputItems.some((item) => item.type === reqInput)
    );
  };

  // Méthode pour calculer la production
  Factory.prototype.calculateOutput = function (inputItems) {
    const multipliers = {
      oil_mill: 2,
      sawmill: 2,
      sugar_refinery: 2,
      spinnery: 2,
      winery: 2,
      bakery: 6,
      chip_factory: 6,
      toy_factory: 3,
      wagon_factory: 4,
      textile_workshop: 2,
      manure_factory: 2,
      dairy: 1,
      chocolate_factory: 2,
      fertilizer_plant: 2,
    };

    const outputTypes = {
      oil_mill: "oil",
      sawmill: "planks",
      sugar_refinery: "sugar",
      spinnery: "yarn",
      winery: "wine",
      bakery: "cake",
      chip_factory: "chips",
      toy_factory: "toys",
      wagon_factory: "wagons",
      textile_workshop: "clothing",
      manure_factory: "fertilizer",
      dairy: "butter",
      chocolate_factory: "chocolate",
      fertilizer_plant: "fertilizer",
    };

    const minQuantity = Math.min(...inputItems.map((i) => i.quantity));
    return {
      type: outputTypes[this.type],
      quantity: minQuantity * (multipliers[this.type] || 1),
      value:
        (inputItems.reduce((sum, item) => sum + item.value, 0) *
          (multipliers[this.type] || 1)) /
        inputItems.length,
    };
  };

  // Méthode pour effectuer une maintenance
  Factory.prototype.performMaintenance = async function () {
    this.isOperational = true;
    this.lastMaintenance = new Date();
    return this.save();
  };

  return Factory;
};
