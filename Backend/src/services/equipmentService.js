const { Equipment, Field, sequelize } = require("../models");
const { Op } = require("sequelize");

// Implémentation de l'Object Pool Pattern pour la gestion des équipements
class EquipmentPool {
  constructor() {
    this.pool = new Map(); // Map<FarmId, Set<EquipmentId>>
  }

  static getInstance() {
    if (!EquipmentPool.instance) {
      EquipmentPool.instance = new EquipmentPool();
    }
    return EquipmentPool.instance;
  }

  addToPool(farmId, equipmentId) {
    if (!this.pool.has(farmId)) {
      this.pool.set(farmId, new Set());
    }
    this.pool.get(farmId).add(equipmentId);
  }

  removeFromPool(farmId, equipmentId) {
    if (this.pool.has(farmId)) {
      this.pool.get(farmId).delete(equipmentId);
    }
  }

  getAvailable(farmId) {
    return this.pool.has(farmId) ? Array.from(this.pool.get(farmId)) : [];
  }
}

class EquipmentService {
  static async initializeFarmEquipment(farmId, options = {}) {
    const equipments = [
      // Véhicules communs
      ...Array(5)
        .fill()
        .map((_, i) => ({
          FarmId: farmId,
          type: "tractor",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      ...Array(3)
        .fill()
        .map((_, i) => ({
          FarmId: farmId,
          type: "trailer",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      ...Array(2)
        .fill()
        .map((_, i) => ({
          FarmId: farmId,
          type: "harvester",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      ...Array(2)
        .fill()
        .map((_, i) => ({
          FarmId: farmId,
          type: "plow",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      ...Array(2)
        .fill()
        .map((_, i) => ({
          FarmId: farmId,
          type: "fertilizer_spreader",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      ...Array(2)
        .fill()
        .map((_, i) => ({
          FarmId: farmId,
          type: "planter",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),

      // Matériel spécialisé (1 unité chacun)
      {
        FarmId: farmId,
        type: "harvester",
        subtype: "grape",
        isAvailable: true,
      },
      {
        FarmId: farmId,
        type: "harvester",
        subtype: "olive",
        isAvailable: true,
      },
      {
        FarmId: farmId,
        type: "harvester",
        subtype: "potato",
        isAvailable: true,
      },
      { FarmId: farmId, type: "harvester", subtype: "beet", isAvailable: true },
      {
        FarmId: farmId,
        type: "harvester",
        subtype: "cotton",
        isAvailable: true,
      },
      {
        FarmId: farmId,
        type: "harvester",
        subtype: "vegetable",
        isAvailable: true,
      },
      {
        FarmId: farmId,
        type: "harvester",
        subtype: "spinach",
        isAvailable: true,
      },
      { FarmId: farmId, type: "harvester", subtype: "pea", isAvailable: true },
      { FarmId: farmId, type: "harvester", subtype: "bean", isAvailable: true },
      { FarmId: farmId, type: "planter", subtype: "tree", isAvailable: true },
      { FarmId: farmId, type: "planter", subtype: "potato", isAvailable: true },
      {
        FarmId: farmId,
        type: "planter",
        subtype: "vegetable",
        isAvailable: true,
      },
      { FarmId: farmId, type: "trailer", subtype: "semi", isAvailable: true },
    ];
    const created = await Equipment.bulkCreate(equipments, options);
    // Ajouter tous les équipements créés au pool
    const pool = EquipmentPool.getInstance();
    for (const eq of created) {
      pool.addToPool(farmId, eq.id);
    }
    return created;
  }

  static async getAllEquipment(farmId) {
    return Equipment.findAll({
      where: { FarmId: farmId },
      order: [
        ["type", "ASC"],
        ["subtype", "ASC"],
      ],
    });
  }

  static async getAvailableEquipment(farmId, equipmentTypes) {
    return Equipment.findAll({
      where: {
        FarmId: farmId,
        subtype: { [Op.in]: equipmentTypes },
        isAvailable: true,
        maintenanceRequired: false,
      },
    });
  }

  static async reserveEquipment(equipmentId, fieldId, durationMinutes = 30) {
    const transaction = await sequelize.transaction();
    try {
      const equipment = await Equipment.findByPk(equipmentId, { transaction });
      if (
        !equipment ||
        !equipment.isAvailable ||
        equipment.maintenanceRequired
      ) {
        throw new Error("Equipment not available");
      }

      equipment.isAvailable = false;
      equipment.FieldId = fieldId;
      equipment.lastUsedAt = new Date();
      await equipment.save({ transaction });

      // Retirer du pool
      EquipmentPool.getInstance().removeFromPool(equipment.FarmId, equipment.id);

      // Libération automatique après la durée spécifiée
      setTimeout(async () => {
        try {
          await this.releaseEquipment(equipmentId);
        } catch (error) {
          console.error("Failed to auto-release equipment:", error);
        }
      }, durationMinutes * 60000);

      await transaction.commit();
      return equipment;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async releaseEquipment(equipmentId) {
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment) throw new Error("Equipment not found");

    equipment.isAvailable = true;
    equipment.FieldId = null;
    await equipment.save();

    // Remettre dans le pool
    EquipmentPool.getInstance().addToPool(equipment.FarmId, equipment.id);

    return equipment;
  }

  static async performMaintenance(equipmentId) {
    const equipment = await Equipment.findByPk(equipmentId);
    if (!equipment) throw new Error("Equipment not found");

    equipment.maintenanceRequired = false;
    equipment.lastMaintenance = new Date();
    await equipment.save();

    return equipment;
  }

  static async checkEquipmentRequirements(farmId, requirements) {
    const availableEquipment = await this.getAvailableEquipment(
      farmId,
      requirements
    );
    return availableEquipment.length >= requirements.length;
  }
}

module.exports = EquipmentService;
module.exports.EquipmentPool = EquipmentPool;
