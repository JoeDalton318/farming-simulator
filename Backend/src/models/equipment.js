module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define("Equipment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM(
        "tractor",
        "harvester",
        "planter",
        "fertilizer_spreader",
        "plow",
        "trailer",
        "semi_trailer",
        "milking_machine",
        "shearing_machine"
      ),
      allowNull: false,
    },
    subtype: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    maintenanceRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  Equipment.associate = (models) => {
    Equipment.belongsTo(models.Farm);
  };

  // Méthode pour vérifier la disponibilité
  Equipment.prototype.checkAvailability = function () {
    return this.isAvailable && !this.maintenanceRequired;
  };

  // Méthode pour enregistrer l'utilisation
  Equipment.prototype.recordUsage = async function () {
    this.lastUsedAt = new Date();
    await this.save();
  };

  return Equipment;
};
