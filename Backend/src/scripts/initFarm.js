const {
  sequelize,
  Farm,
  Crop,
  Equipment,
  Storage,
  Factory,
  Animal,
  Greenhouse,
  WaterTank,
  Warehouse,
  Field,
} = require("../models");
const config = require("../config/config");
const EquipmentService = require('../services/equipmentService');
const StorageService = require('../services/storageService');

async function clearExistingData() {
  console.log("Clearing existing data...");
  await Warehouse.destroy({ where: {} });
  await Greenhouse.destroy({ where: {} });
  await Animal.destroy({ where: {} });
  await WaterTank.destroy({ where: {} });
  await Factory.destroy({ where: {} });
  await Storage.destroy({ where: {} });
  await Field.destroy({ where: {} });
  await Farm.destroy({ where: {} });
  await Equipment.destroy({ where: {} });
  await Crop.destroy({ where: {} });
}

async function initializeFarm() {
  try {
    // Créer la base de données si elle n'existe pas
    try {
      await sequelize.authenticate();
      console.log("✓ Connexion à PostgreSQL réussie");
    } catch (error) {
      if (error.code === '3D000') {
        console.log("⚠️  Base de données 'farming_simulator' non trouvée");
        console.log("🔧 Création de la base de données...");
        
        // Se connecter à la base de données par défaut pour créer farming_simulator
        const tempSequelize = new (require('sequelize'))(
          'postgres',
          process.env.DB_USER || 'postgres',
          process.env.DB_PASSWORD || 'postgres',
          {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: false,
          }
        );
        
        await tempSequelize.query('CREATE DATABASE farming_simulator;');
        await tempSequelize.close();
        console.log("✓ Base de données 'farming_simulator' créée");
      } else {
        throw error;
      }
    }
    
    // Synchroniser la base de données pour créer toutes les tables
    await sequelize.sync({ force: true });
    console.log("Starting comprehensive farm initialization...");

    // Optionnel: Nettoyer les données existantes
    await clearExistingData();

    // 1. Création de toutes les cultures (incluant les nouvelles du patch)
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
      // Ajout des nouvelles cultures du patch
      {
        name: "grass",
        yieldPerHectare: 5000,
        equipmentRequirements: [
          "tractor",
          "standard_planter",
          "standard_harvester",
        ],
        growthTime: 1, // Croissance plus rapide
        baseValue: 0.5, // Valeur moindre
        noPlowRequired: true, // Nouvelle propriété du patch
      },
      {
        name: "cacao",
        yieldPerHectare: 1000,
        equipmentRequirements: ["tractor", "tree_planter", "tree_harvester"],
        growthTime: 3, // Croissance plus longue
        baseValue: 3, // Valeur plus élevée
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
      // Ajouter les nouveaux équipements du patch :
      {
        type: "milking_machine",
        subtype: "standard",
        isAvailable: true,
        maintenanceRequired: false,
      },
      {
        type: "shearing_machine",
        subtype: "standard",
        isAvailable: true,
        maintenanceRequired: false,
      },
    ];

    // Vérifier si les équipements existent déjà
    const existingEquipment = await Equipment.count();
    if (existingEquipment === 0) {
      const createdEquipments = await Equipment.bulkCreate(equipments);
      // Initialiser le pool d'équipements (Object Pool)
      const pool = EquipmentService.EquipmentPool ? EquipmentService.EquipmentPool.getInstance() : require('../services/equipmentService').EquipmentPool.getInstance();
      for (const eq of createdEquipments) {
        pool.addToPool(1, eq.id); // 1 = id de la ferme principale (à adapter dynamiquement si besoin)
      }
      console.log(`✓ ${equipments.length} équipements créés et ajoutés au pool`);
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
            money: 0,
            waterCapacity: 20000,
          },
          { transaction }
        );
        console.log("✓ Ferme principale créée");
      } else {
        console.log("✓ Ferme principale existe déjà");
      }

      // Dans la transaction, après avoir créé la ferme:
      const fields = await Field.bulkCreate(
        Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          state: "harvested",
          FarmId: farm.id,
          fertilized: false,
          irrigationLevel: 0,
        })),
        { transaction }
      );
      console.log(`✓ ${fields.length} champs créés`);

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
            type: "main", // Nouvelle propriété pour distinguer les types
          },
          { transaction }
        );
        console.log("✓ Stockage principal créé");
      }

      // Création de l'entrepôt s'il n'existe pas
      const warehouse = await Warehouse.findOne({
        where: { FarmId: farm.id },
        transaction,
      });

      if (!warehouse) {
        await Warehouse.create(
          {
            FarmId: farm.id,
            capacity: 50000, // Capacité de l'entrepôt
            currentVolume: 0,
            type: "processed", // Type de stockage pour les produits transformés
          },
          { transaction }
        );
        console.log("✓ Entrepôt créé pour les produits transformés");
      }

      // Création du réservoir d'eau s'il n'existe pas
      const waterTank = await WaterTank.findOne({
        where: { FarmId: farm.id },
        transaction,
      });

      if (!waterTank) {
        await WaterTank.create(
          {
            FarmId: farm.id,
            capacity: 20000, // Capacité du réservoir d'eau
            currentVolume: 20000, // Rempli à la création
          },
          { transaction }
        );
        console.log("✓ Réservoir d'eau créé");
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

          // Nouvelles usines du patch
          {
            type: "manure_factory",
            FarmId: farm.id,
            processingRate: 50,
            waterConsumptionRate: 5,
          }, // Usine de compost
          {
            type: "dairy",
            FarmId: farm.id,
            processingRate: 30,
            waterConsumptionRate: 3,
          }, // Laiterie
          {
            type: "chocolate_factory",
            FarmId: farm.id,
            processingRate: 20,
            waterConsumptionRate: 10,
          }, // Chocolaterie
          {
            type: "greenhouse",
            FarmId: farm.id,
            processingRate: 15,
            waterConsumptionRate: 15,
          }, // Serre
        ];

        await Factory.bulkCreate(factories, { transaction });
        console.log(`✓ ${factories.length} usines créées`);
      }
      // Création des animaux initiaux (nouveau du patch)
      const animals = [
        {
          type: "cow",
          name: "Belle",
          FarmId: farm.id,
          waterConsumption: 3,
          grassConsumption: 3,
          productionRate: 20,
          grassStock: 10,
        },
        {
          type: "cow",
          name: "Marguerite",
          FarmId: farm.id,
          waterConsumption: 3,
          grassConsumption: 3,
          productionRate: 20,
          grassStock: 10,
        },
        {
          type: "sheep",
          name: "Mouton",
          FarmId: farm.id,
          waterConsumption: 2,
          grassConsumption: 2,
          productionRate: 5,
          grassStock: 10,
        },
        {
          type: "chicken",
          name: "Poulette",
          FarmId: farm.id,
          waterConsumption: 1,
          grassConsumption: 1,
          productionRate: 1,
          grassStock: 10,
        },
      ];

      await Animal.bulkCreate(animals, { transaction });

      // Création des serres (nouveau du patch)
      await Greenhouse.create(
        {
          FarmId: farm.id,
          waterConsumptionRate: 15,
          isActive: false,
          lastProductionTime: new Date(),
        },
        { transaction }
      );

      await transaction.commit();
      console.log("=== INITIALISATION COMPLÈTE AVEC SUCCÈS ===");
      console.log("Nouvelles fonctionnalités intégrées :");
      console.log("- Système d'eau et réservoir");
      console.log("- Fermes animales (vaches, moutons, poules)");
      console.log("- Serres agricoles");
      console.log("- Nouveaux types de cultures (herbe, cacao)");
      console.log("- Entrepôt pour produits transformés");
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
    // Initialiser l'observer du stockage (Observer Pattern)
    const storageService = StorageService.getInstance();
    storageService.subscribe((event, data) => {
      console.log(`[STOCKAGE][${event}]`, data);
    });
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
