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
  });

  Field.associate = (models) => {
    Field.belongsTo(models.Farm);
    Field.hasMany(models.FieldHistory);
  };

  return Field;
};
