const { Field, Crop } = require("../models");

class FieldService {
  static async createField(farmId) {
    return Field.create({
      FarmId: farmId,
      size: 1.0,
      currentState: "harvested",
    });
  }

  static async plowField(fieldId) {
    const field = await Field.findByPk(fieldId);
    if (!field) throw new Error("Field not found");

    if (field.currentState !== "harvested") {
      throw new Error("Field must be harvested before plowing");
    }

    field.currentState = "plowed";
    await field.save();
    return field;
  }

  static async plantCrop(fieldId, cropType) {
    const field = await Field.findByPk(fieldId);
    if (!field) throw new Error("Field not found");

    const crop = await Crop.findOne({ where: { name: cropType } });
    if (!crop) throw new Error("Crop type not supported");

    if (field.currentState !== "plowed") {
      throw new Error("Field must be plowed before planting");
    }

    field.currentState = "planted";
    field.currentCropType = cropType;
    await field.save();
    return field;
  }

  static async fertilizeField(fieldId) {
    const field = await Field.findByPk(fieldId);
    if (!field) throw new Error("Field not found");

    if (field.currentState !== "planted") {
      throw new Error("Field must be planted before fertilizing");
    }

    field.isFertilized = true;
    await field.save();
    return field;
  }

  static async harvestField(fieldId) {
    const field = await Field.findByPk(fieldId, {
      include: [
        {
          model: Crop,
          as: "cropData",
          where: { name: sequelize.col("Field.currentCropType") },
          required: false,
        },
      ],
    });

    if (!field) throw new Error("Field not found");
    if (field.currentState !== "ready_to_harvest") {
      throw new Error("Field is not ready for harvest");
    }

    const yieldAmount = this.calculateYield(field);

    // Réinitialiser le champ
    field.currentState = "harvested";
    field.currentCropType = null;
    field.isFertilized = false;
    await field.save();

    return yieldAmount;
  }

  static calculateYield(field) {
    const baseYield = field.cropData?.yieldPerHectare || 0;
    return field.isFertilized ? baseYield * 1.5 : baseYield;
  }
}

module.exports = FieldService;
