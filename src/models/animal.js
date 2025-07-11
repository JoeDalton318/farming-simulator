module.exports = (sequelize, DataTypes) => {
  const Animal = sequelize.define("Animal", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.ENUM("cow", "sheep", "chicken"),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    grassStock: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      validate: {
        min: -5,
        max: 10,
      },
    },
    isAlive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastFed: {
      type: DataTypes.DATE,
    },
  });

  Animal.associate = (models) => {
    Animal.belongsTo(models.Farm);
    Animal.hasMany(models.StorageItem, {
      foreignKey: "sourceId",
      constraints: false,
    });
  };

  // Méthode pour nourrir l'animal
  Animal.prototype.feed = async function (grassAmount) {
    if (!this.isAlive) throw new Error("Animal is dead");
    this.grassStock = Math.min(10, this.grassStock + grassAmount);
    this.lastFed = new Date();
    return this.save();
  };

  return Animal;
};
