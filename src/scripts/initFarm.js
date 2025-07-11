const {
  sequelize,
  Farm,
  Crop,
  Equipment,
  Storage,
  Factory,
} = require("../models");
const config = require("../config/config");

async function initializeFarm() {
  try {
    console.log("Starting comprehensive farm initialization...");

    // Optionnel mais bon: Nettoyer les données existantes
    await clearExistingData();

    // 1. Création de toutes les cultures avec leurs spécifications complètes
    const crops = [
      // ===== CÉRÉALES STANDARD (2 min de croissance) =====
      {
        name: "wheat",
        yieldPerHectare: 1000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "standard_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      {
        name: "barley",
        yieldPerHectare: 1000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "standard_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      {
        name: "oat",
        yieldPerHectare: 1000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "standard_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      {
        name: "canola",
        yieldPerHectare: 1000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "standard_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      {
        name: "soy",
        yieldPerHectare: 1000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "standard_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      {
        name: "corn",
        yieldPerHectare: 3000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "standard_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      {
        name: "sunflower",
        yieldPerHectare: 3000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "standard_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },

      // ===== CULTURES SPÉCIALISÉES =====
      // Vignes
      {
        name: "grape",
        yieldPerHectare: 1500,
        equipmentRequirements: [
          "tractor",
          "grape_planter",
          "grape_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Olives
      {
        name: "olive",
        yieldPerHectare: 1500,
        equipmentRequirements: [
          "tractor",
          "tree_planter",
          "olive_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Pommes de terre
      {
        name: "potato",
        yieldPerHectare: 5000,
        equipmentRequirements: [
          "tractor",
          "potato_planter",
          "potato_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Betteraves
      {
        name: "beet",
        yieldPerHectare: 3500,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "beet_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Coton
      {
        name: "cotton",
        yieldPerHectare: 750,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "cotton_harvester",
          "semi_trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Canne à sucre
      {
        name: "sugar_cane",
        yieldPerHectare: 5000,
        equipmentRequirements: [
          "tractor",
          "cane_planter",
          "cane_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Peuplier
      {
        name: "poplar",
        yieldPerHectare: 1500,
        equipmentRequirements: [
          "tractor",
          "tree_planter",
          "tree_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Légumes
      {
        name: "vegetable",
        yieldPerHectare: 2500,
        equipmentRequirements: [
          "tractor",
          "vegetable_planter",
          "vegetable_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Épinards
      {
        name: "spinach",
        yieldPerHectare: 3000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "spinach_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Pois
      {
        name: "pea",
        yieldPerHectare: 7500,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "pea_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
      // Haricots verts
      {
        name: "green_bean",
        yieldPerHectare: 7500,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "bean_harvester",
          "trailer",
        ],
        growthTime: 2,
        baseValue: 1,
      },
    ];

    // Vérifier si les cultures existent déjà
    const existingCrops = await Crop.count();
    if (existingCrops === 0) {
      await Crop.bulkCreate(crops);
      console.log(`✓ ${crops.length} cultures créées`);
    } else {
      console.log(`✓ ${existingCrops} cultures existent déjà`);
    }

    // 2. Création de TOUS les équipements selon le cahier des charges
    const equipments = [
      // ===== ÉQUIPEMENTS COMMUNS =====
      // 5 Tracteurs
      ...Array(5)
        .fill()
        .map((_, i) => ({
          type: "tractor",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      // 3 Remorques standard
      ...Array(3)
        .fill()
        .map((_, i) => ({
          type: "trailer",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      // 2 Moissonneuses-batteuses standard
      ...Array(2)
        .fill()
        .map((_, i) => ({
          type: "harvester",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      // 2 Charrues
      ...Array(2)
        .fill()
        .map((_, i) => ({
          type: "plow",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      // 2 Fertilisateurs
      ...Array(2)
        .fill()
        .map((_, i) => ({
          type: "fertilizer_spreader",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),
      // 2 Semeuses standard
      ...Array(2)
        .fill()
        .map((_, i) => ({
          type: "planter",
          subtype: "standard",
          isAvailable: true,
          maintenanceRequired: false,
        })),

      // ===== ÉQUIPEMENTS SPÉCIALISÉS (1 unité chacun) =====
      // Pour vignes
      {
        type: "planter",
        subtype: "grape",
        isAvailable: true,
        maintenanceRequired: false,
      },
      {
        type: "harvester",
        subtype: "grape",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour olives
      {
        type: "planter",
        subtype: "tree",
        isAvailable: true,
        maintenanceRequired: false,
      },
      {
        type: "harvester",
        subtype: "olive",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour pommes de terre
      {
        type: "planter",
        subtype: "potato",
        isAvailable: true,
        maintenanceRequired: false,
      },
      {
        type: "harvester",
        subtype: "potato",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour betteraves
      {
        type: "harvester",
        subtype: "beet",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour coton
      {
        type: "harvester",
        subtype: "cotton",
        isAvailable: true,
        maintenanceRequired: false,
      },
      {
        type: "trailer",
        subtype: "semi",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour canne à sucre
      {
        type: "planter",
        subtype: "cane",
        isAvailable: true,
        maintenanceRequired: false,
      },
      {
        type: "harvester",
        subtype: "cane",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour arbres (peuplier)
      {
        type: "harvester",
        subtype: "tree",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour légumes
      {
        type: "planter",
        subtype: "vegetable",
        isAvailable: true,
        maintenanceRequired: false,
      },
      {
        type: "harvester",
        subtype: "vegetable",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour épinards
      {
        type: "harvester",
        subtype: "spinach",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour pois
      {
        type: "harvester",
        subtype: "pea",
        isAvailable: true,
        maintenanceRequired: false,
      },

      // Pour haricots verts
      {
        type: "harvester",
        subtype: "bean",
        isAvailable: true,
        maintenanceRequired: false,
      },
    ];

    // Vérifier si les équipements existent déjà
    const existingEquipment = await Equipment.count();
    if (existingEquipment === 0) {
      await Equipment.bulkCreate(equipments);
      console.log(`✓ ${equipments.length} équipements créés`);
    } else {
      console.log(`✓ ${existingEquipment} équipements existent déjà`);
    }

    // 3. Création de la ferme
    const transaction = await sequelize.transaction();
    try {
      let farm = await Farm.findOne({ where: { name: "Ferme Principale" } });

      if (!farm) {
        farm = await Farm.create(
          {
            name: "Ferme Principale",
            money: 10000,
          },
          { transaction }
        );
        console.log("✓ Ferme principale créée");
      } else {
        console.log("✓ Ferme principale existe déjà");
      }

      // Création du stockage s'il n'existe pas
      const storage = await Storage.findOne({
        where: { FarmId: farm.id },
        transaction,
      });

      if (!storage) {
        await Storage.create(
          {
            FarmId: farm.id,
            capacity: config.storageCapacity,
            currentVolume: 0,
          },
          { transaction }
        );
        console.log("✓ Stockage principal créé");
      }

      // Création des usines
      const existingFactories = await Factory.count({
        where: { FarmId: farm.id },
        transaction,
      });

      if (existingFactories === 0) {
        const factories = [
          // Usines de transformation de base
          { type: "oil_mill", FarmId: farm.id, processingRate: 100 }, // Moulin à huile
          { type: "sawmill", FarmId: farm.id, processingRate: 100 }, // Scierie
          { type: "sugar_refinery", FarmId: farm.id, processingRate: 80 }, // Raffinerie de sucre
          { type: "spinnery", FarmId: farm.id, processingRate: 60 }, // Filature
          { type: "winery", FarmId: farm.id, processingRate: 75 }, // Cave à vin

          // Usines de production avancée
          { type: "bakery", FarmId: farm.id, processingRate: 50 }, // Boulangerie
          { type: "chip_factory", FarmId: farm.id, processingRate: 40 }, // Usine de chips
          { type: "toy_factory", FarmId: farm.id, processingRate: 30 }, // Fabrique de jouets
          { type: "wagon_factory", FarmId: farm.id, processingRate: 20 }, // Fabrique de wagons
          { type: "textile_workshop", FarmId: farm.id, processingRate: 60 }, // Atelier de couture
        ];

        await Factory.bulkCreate(factories, { transaction });
        console.log(`✓ ${factories.length} usines créées`);
      }

      await transaction.commit();
      console.log("=== INITIALISATION COMPLÈTE AVEC SUCCÈS ===");
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  initializeFarm();
}

module.exports = { initializeFarm, clearExistingData };
