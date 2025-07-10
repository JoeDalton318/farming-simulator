module.exports = (sequelize, DataTypes) => {
  const Field = sequelize.define("Field", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    size: {
      type: DataTypes.FLOAT,
      defaultValue: 1.0,
      validate: {
        min: 0.1,
        max: 10.0,
      },
    },
    currentState: {
      type: DataTypes.ENUM(
        "harvested",
        "plowed",
        "planted",
        "fertilized",
        "ready_to_harvest"
      ),
      defaultValue: "harvested",
    },
    currentCropType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isFertilized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    batch: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plantedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    readyAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  Field.associate = (models) => {
    Field.belongsTo(models.Farm);
    Field.hasMany(models.FieldHistory);
    Field.belongsToMany(models.Equipment, { through: "FieldEquipmentUsage" });
  };

  // Méthode pour vérifier si le champ est prêt à être récolté
  Field.prototype.isReadyForHarvest = function () {
    if (this.currentState !== "ready_to_harvest") return false;
    return this.readyAt <= new Date();
  };

  return Field;
};
