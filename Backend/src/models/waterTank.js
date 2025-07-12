module.exports = (sequelize, DataTypes) => {
  const WaterTank = sequelize.define("WaterTank", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 20000,
    },
    currentLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 20000,
      validate: {
        min: 0,
      },
    },
    lastRefillTime: {
      type: DataTypes.DATE,
    },
  });

  WaterTank.associate = (models) => {
    WaterTank.belongsTo(models.Farm);
  };

  WaterTank.prototype.consume = async function (amount) {
    if (this.currentLevel < amount) {
      throw new Error("Not enough water in tank");
    }
    this.currentLevel -= amount;
    await this.save();
    return this.currentLevel;
  };

  WaterTank.prototype.refill = async function () {
    this.currentLevel = this.capacity;
    this.lastRefillTime = new Date();
    await this.save();
    return this.currentLevel;
  };

  return WaterTank;
};
