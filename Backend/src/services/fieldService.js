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

// Implémentation du State Pattern pour le cycle de vie des champs
class FieldStateService {
  static canTransition(current, next) {
    const transitions = {
      harvested: ["plowed"],
      plowed: ["seeded"],
      seeded: ["fertilized", "ready_to_harvest"],
      fertilized: ["ready_to_harvest"],
      ready_to_harvest: ["harvested"]
    };
    return transitions[current]?.includes(next);
  }

  static assertTransition(current, next) {
    if (!this.canTransition(current, next)) {
      throw new Error(`Transition de '${current}' vers '${next}' non autorisée.`);
    }
  }
}

// Implémentation du Command Pattern pour les actions sur les champs
class PlowFieldCommand {
  constructor(fieldId) { this.fieldId = fieldId; }
  async execute() { return FieldService._plowField(this.fieldId); }
}
class PlantCropCommand {
  constructor(fieldId, cropType) { this.fieldId = fieldId; this.cropType = cropType; }
  async execute() { return FieldService._plantCrop(this.fieldId, this.cropType); }
}
class FertilizeFieldCommand {
  constructor(fieldId) { this.fieldId = fieldId; }
  async execute() { return FieldService._fertilizeField(this.fieldId); }
}
class HarvestFieldCommand {
  constructor(fieldId) { this.fieldId = fieldId; }
  async execute() { return FieldService._harvestField(this.fieldId); }
}

class FieldService {
  static async createField(farmId, options = {}) {
    // Récupérer le prochain numéro disponible pour la ferme si non fourni
    let number = options.number;
    if (!number) {
      const lastField = await Field.findOne({
        where: { FarmId: farmId },
        order: [["number", "DESC"]],
      });
      number = lastField ? lastField.number + 1 : 1;
    }
    const size = options.size || 1.0;
    return Field.create({
      FarmId: farmId,
      number,
      size,
      state: "harvested",
      ...options // pour d'autres champs éventuels
    });
  }

  static async plowField(fieldId) { return new PlowFieldCommand(fieldId).execute(); }

  static async plantCrop(fieldId, cropType) { return new PlantCropCommand(fieldId, cropType).execute(); }

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

  static async fertilizeField(fieldId) { return new FertilizeFieldCommand(fieldId).execute(); }

  static async harvestField(fieldId) { return new HarvestFieldCommand(fieldId).execute(); }

  static calculateYield(field) {
    const baseYield = field.expectedYield || 0;
    return field.fertilized ? Math.floor(baseYield * 1.5) : baseYield;
  }

  static async getFieldStatus(fieldId) {
    const field = await Field.findByPk(fieldId, {
      include: [
        { model: Crop, as: "crop" },
        { model: FieldHistory, as: "history", order: [["createdAt", "DESC"]], limit: 10 },
      ],
    });

    if (!field) throw new Error("Field not found");

    // Vérifier si le champ est prêt pour la récolte
    if (field.state === "seeded" && field.lastActionTime) {
      const timeSinceSeeding = Date.now() - field.lastActionTime.getTime();
      const growthTimeMs = 2 * 60 * 1000; // 2 minutes en millisecondes
      
      if (timeSinceSeeding >= growthTimeMs) {
        await field.update({ 
          state: "ready_to_harvest",
          lastActionTime: new Date()
        });
        field.state = "ready_to_harvest";
      }
    }

    return {
      id: field.id,
      state: field.state,
      cropType: field.cropType,
      fertilized: field.fertilized,
      number: field.number,
      batch: field.batch,
      lastActionTime: field.lastActionTime,
      expectedYield: field.expectedYield,
      irrigationLevel: field.irrigationLevel,
      history: field.history,
    };
  }

  // Nouvelle méthode pour gérer la croissance automatique
  static async updateFieldGrowth() {
    const fields = await Field.findAll({
      where: {
        state: "seeded",
        lastActionTime: {
          [Op.lt]: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes
        }
      }
    });

    for (const field of fields) {
      await field.update({ 
        state: "ready_to_harvest",
        lastActionTime: new Date()
      });
    }

    return fields.length;
  }

  // Les vraies implémentations internes (privées)
  static async _plowField(fieldId) {
    const transaction = await sequelize.transaction();
    try {
      const field = await Field.findByPk(fieldId, { transaction });
      if (!field) throw new Error("Field not found");
      FieldStateService.assertTransition(field.state, "plowed");

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

      field.state = "plowed";
      await field.save({ transaction });

      await transaction.commit();
      return field;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async _plantCrop(fieldId, cropType) {
    const transaction = await sequelize.transaction();
    try {
      const [field, crop] = await Promise.all([
        Field.findByPk(fieldId, { transaction }),
        Crop.findOne({ where: { name: cropType }, transaction }),
      ]);

      if (!field) throw new Error("Field not found");
      if (!crop) throw new Error("Crop type not supported");
      FieldStateService.assertTransition(field.state, "seeded");

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
          state: "seeded",
          cropType: cropType,
          lastActionTime: plantedAt,
          expectedYield: crop.yieldPerHectare,
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

  static async _fertilizeField(fieldId) {
    const transaction = await sequelize.transaction();
    try {
      const field = await Field.findByPk(fieldId, { transaction });
      if (!field) throw new Error("Field not found");
      FieldStateService.assertTransition(field.state, "fertilized");

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

      await field.update({ 
        state: "fertilized",
        fertilized: true,
        lastActionTime: new Date()
      }, { transaction });

      await transaction.commit();
      return field;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async _harvestField(fieldId) {
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
      FieldStateService.assertTransition(field.state, "harvested");

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
          itemType: field.cropType,
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
          state: "harvested",
          cropType: null,
          fertilized: false,
          lastActionTime: new Date(),
          expectedYield: null,
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
}

module.exports = FieldService;
