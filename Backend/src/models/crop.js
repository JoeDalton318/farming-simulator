module.exports = (sequelize, DataTypes) => {
  const Crop = sequelize.define('Crop', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    yieldPerHectare: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    equipmentRequirements: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    growthTime: {
      type: DataTypes.INTEGER, // en minutes
      defaultValue: 2,
    },
    baseValue: {
      type: DataTypes.INTEGER, 
      defaultValue: 1,
    },
  });

  return Crop;
};