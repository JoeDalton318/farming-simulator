const {
  sequelize,
  Field,
  Crop,
  Equipment,
  FieldHistory,
  Storage,
  StorageItem,
} = require("../models");
const { Op } = require("sequelize");

class FieldService {
  static async createField(farmId) {
    return Field.create({
      FarmId: farmId,
      size: 1.0,
      currentState: "harvested",
    });
  }

  static async plowField(fieldId) {
    const transaction = await sequelize.transaction();
    try {
      const field = await Field.findByPk(fieldId, { transaction });
      if (!field) throw new Error("Field not found");

      if (field.currentState !== "harvested") {
        throw new Error("Field must be harvested before plowing");
      }

      // Simuler le temps de labour (30 secondes)
      await new Promise((resolve) => setTimeout(resolve, 30000));

      await FieldHistory.create(
        {
          FieldId: field.id,
          action: "plow",
          previousState: field.currentState,
          newState: "plowed",
          duration: 30,
        },
        { transaction }
      );

      field.currentState = "plowed";
      await field.save({ transaction });

      await transaction.commit();
      return field;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async plantCrop(fieldId, cropType) {
    const transaction = await sequelize.transaction();
    try {
      const [field, crop] = await Promise.all([
        Field.findByPk(fieldId, { transaction }),
        Crop.findOne({ where: { name: cropType }, transaction }),
      ]);

      if (!field) throw new Error("Field not found");
      if (!crop) throw new Error("Crop type not supported");
      if (field.currentState !== "plowed") {
        throw new Error("Field must be plowed before planting");
      }

      // Vérifier la disponibilité des équipements
      await this.checkEquipmentAvailability(
        field.FarmId,
        crop.equipmentRequirements,
        transaction
      );

      // Simuler le temps de semis (30 secondes)
      await new Promise((resolve) => setTimeout(resolve, 30000));

      await FieldHistory.create(
        {
          FieldId: field.id,
          action: "plant",
          cropType,
          previousState: field.currentState,
          newState: "planted",
          duration: 30,
        },
        { transaction }
      );

      const plantedAt = new Date();
      const readyAt = new Date(plantedAt.getTime() + crop.growthTime * 60000);

      await field.update(
        {
          currentState: "planted",
          currentCropType: cropType,
          plantedAt,
          readyAt,
          isFertilized: false,
        },
        { transaction }
      );

      await transaction.commit();
      return field;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async checkEquipmentAvailability(
    farmId,
    equipmentRequirements,
    transaction
  ) {
    const availableEquipment = await Equipment.count({
      where: {
        FarmId: farmId,
        subtype: { [Op.in]: equipmentRequirements },
        isAvailable: true,
        maintenanceRequired: false,
      },
      transaction,
    });

    if (availableEquipment < equipmentRequirements.length) {
      throw new Error("Required equipment not available");
    }
  }

  static async fertilizeField(fieldId) {
    const transaction = await sequelize.transaction();
    try {
      const field = await Field.findByPk(fieldId, { transaction });
      if (!field) throw new Error("Field not found");
      if (field.currentState !== "planted") {
        throw new Error("Field must be planted before fertilizing");
      }

      // Simuler le temps de fertilisation (30 secondes)
      await new Promise((resolve) => setTimeout(resolve, 30000));

      await FieldHistory.create(
        {
          FieldId: field.id,
          action: "fertilize",
          previousState: field.currentState,
          duration: 30,
        },
        { transaction }
      );

      await field.update({ isFertilized: true }, { transaction });

      await transaction.commit();
      return field;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async harvestField(fieldId) {
    const transaction = await sequelize.transaction();
    try {
      const field = await Field.findByPk(fieldId, {
        include: [
          {
            model: Crop,
            as: "cropData",
            where: { name: sequelize.col("Field.currentCropType") },
            required: false,
          },
          {
            model: FieldHistory,
            order: [["createdAt", "DESC"]],
            limit: 1,
          },
        ],
        transaction,
      });

      if (!field) throw new Error("Field not found");
      if (!field.isReadyForHarvest()) {
        throw new Error("Field is not ready for harvest");
      }

      // Simuler le temps de récolte (30 secondes)
      await new Promise((resolve) => setTimeout(resolve, 30000));

      const yieldAmount = this.calculateYield(field);
      const storage = await Storage.findOne({
        where: { FarmId: field.FarmId },
        transaction,
      });

      if (!storage) throw new Error("Storage not found");

      // Vérifier la capacité de stockage
      if (storage.currentVolume + yieldAmount > storage.capacity) {
        throw new Error("Storage capacity exceeded");
      }

      // Ajouter la récolte au stockage
      await StorageItem.create(
        {
          StorageId: storage.id,
          itemType: field.currentCropType,
          quantity: yieldAmount,
          valuePerUnit: 1, // 1 L = 1 pièce d'or
        },
        { transaction }
      );

      // Mettre à jour le volume du stockage
      await storage.update(
        {
          currentVolume: sequelize.literal(`currentVolume + ${yieldAmount}`),
        },
        { transaction }
      );

      await FieldHistory.create(
        {
          FieldId: field.id,
          action: "harvest",
          yield: yieldAmount,
          previousState: field.currentState,
          newState: "harvested",
          duration: 30,
        },
        { transaction }
      );

      // Réinitialiser le champ
      await field.update(
        {
          currentState: "harvested",
          currentCropType: null,
          isFertilized: false,
          plantedAt: null,
          readyAt: null,
        },
        { transaction }
      );

      await transaction.commit();
      return yieldAmount;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static calculateYield(field) {
    const baseYield = field.cropData?.yieldPerHectare || 0;
    return field.isFertilized ? Math.floor(baseYield * 1.5) : baseYield;
  }

  static async getFieldStatus(fieldId) {
    const field = await Field.findByPk(fieldId, {
      include: [
        { model: Crop, as: "cropData" },
        { model: FieldHistory, order: [["createdAt", "DESC"]], limit: 10 },
      ],
    });

    if (!field) throw new Error("Field not found");

    return {
      id: field.id,
      currentState: field.currentState,
      cropType: field.currentCropType,
      isFertilized: field.isFertilized,
      size: field.size,
      plantedAt: field.plantedAt,
      readyAt: field.readyAt,
      timeRemaining: field.readyAt
        ? Math.max(0, field.readyAt - new Date())
        : null,
      cropData: field.cropData,
      history: field.FieldHistories,
    };
  }
}

module.exports = FieldService;
