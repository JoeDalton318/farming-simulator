module.exports = (sequelize, DataTypes) => {
  const Factory = sequelize.define("Factory", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        "oil_mill",
        "sawmill",
        "sugar_refinery",
        "spinnery",
        "bakery",
        "chip_factory",
        "winery",
        "toy_factory",
        "wagon_factory"
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
    },
  });

  Factory.associate = (models) => {
    Factory.belongsTo(models.Farm);
    Factory.hasMany(models.ProductionLog);
  };

  // Méthode pour traiter des matières premières
  Factory.prototype.process = async function (inputItems) {
    if (!this.isOperational) {
      throw new Error("Factory is not operational");
    }

    // Vérifier les intrants selon le type d'usine
    const canProcess = this.checkInputs(inputItems);
    if (!canProcess) {
      throw new Error("Invalid input items for this factory type");
    }

    // Logique de traitement spécifique
    const output = this.createOutput(inputItems);

    return output;
  };

  return Factory;
};
