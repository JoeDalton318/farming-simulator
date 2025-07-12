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
    waterConsumption: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // L/s
    },
    grassConsumption: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // L/s
    },
    productionRate: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // L/s
    },
    isAlive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastFed: {
      type: DataTypes.DATE,
    },
    lastMilked: {
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
    
    // Vérifier si l'animal meurt
    if (this.grassStock <= -5) {
      this.isAlive = false;
    }
    
    return this.save();
  };

  // Méthode pour consommer de l'herbe
  Animal.prototype.consumeGrass = async function () {
    if (!this.isAlive) return false;
    
    this.grassStock -= this.grassConsumption;
    this.lastFed = new Date();
    
    // Vérifier si l'animal meurt
    if (this.grassStock <= -5) {
      this.isAlive = false;
    }
    
    return this.save();
  };

  // Méthode pour produire
  Animal.prototype.produce = async function () {
    if (!this.isAlive || this.grassStock < 0) return null;
    
    const production = {
      cow: { milk: 20, manure: 5 },
      sheep: { wool: 5, manure: 5 },
      chicken: { eggs: 1 }
    };
    
    return production[this.type] || {};
  };

  return Animal;
};
