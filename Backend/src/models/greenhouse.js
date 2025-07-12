module.exports = (sequelize, DataTypes) => {
  const Greenhouse = sequelize.define("Greenhouse", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM("strawberry", "tomato", "lettuce"),
      defaultValue: "strawberry",
    },
    waterConsumptionRate: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    lastProductionTime: {
      type: DataTypes.DATE,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Greenhouse.associate = (models) => {
    Greenhouse.belongsTo(models.Farm);
    Greenhouse.hasMany(models.StorageItem, {
      foreignKey: "sourceId",
      constraints: false,
    });
  };

  Greenhouse.prototype.produce = async function () {
    if (!this.isActive) throw new Error("Greenhouse is not active");
    const now = new Date();
    this.lastProductionTime = now;
    await this.save();
    return { success: true, amount: 1500 };
  };

  return Greenhouse;
};
