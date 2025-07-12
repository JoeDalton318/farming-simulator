// models/fieldHistory.js
module.exports = (sequelize, DataTypes) => {
  const FieldHistory = sequelize.define('FieldHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    action: {
      type: DataTypes.ENUM(
        'plow',
        'seed',
        'fertilize',
        'harvest',
        'irrigate' // Nouveau du patch
      ),
      allowNull: false
    },
    cropType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    details: { // Pour stocker des infos supplémentaires
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  FieldHistory.associate = function(models) {
    this.belongsTo(models.Field, {
      foreignKey: {
        name: 'FieldId',
        allowNull: false
      }
    });
    this.belongsTo(models.Equipment, { // Pour savoir quel équipement a été utilisé
      foreignKey: {
        name: 'EquipmentId',
        allowNull: true
      }
    });
  };

  return FieldHistory;
};