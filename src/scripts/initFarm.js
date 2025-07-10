const { sequelize, Farm, Crop, Equipment } = require("../models");

async function initializeFarm() {
  try {
    console.log("Starting farm initialization...");

    // 1. Création des cultures
    const crops = [
      // Céréales standard
      {
        name: "wheat",
        yieldPerHectare: 1000,
        equipmentRequirements: ["tractor", "planter", "harvester", "trailer"],
      },
      {
        name: "barley",
        yieldPerHectare: 1000,
        equipmentRequirements: ["tractor", "planter", "harvester", "trailer"],
      },
      {
        name: "oat",
        yieldPerHectare: 1000,
        equipmentRequirements: ["tractor", "planter", "harvester", "trailer"],
      },
      {
        name: "canola",
        yieldPerHectare: 1000,
        equipmentRequirements: ["tractor", "planter", "harvester", "trailer"],
      },
      {
        name: "soy",
        yieldPerHectare: 1000,
        equipmentRequirements: ["tractor", "planter", "harvester", "trailer"],
      },

      // Cultures spéciales
      {
        name: "grape",
        yieldPerHectare: 1500,
        equipmentRequirements: [
          "tractor",
          "grape_planter",
          "grape_harvester",
          "trailer",
        ],
      },
      {
        name: "olive",
        yieldPerHectare: 1500,
        equipmentRequirements: [
          "tractor",
          "tree_planter",
          "olive_harvester",
          "trailer",
        ],
      },
      {
        name: "potato",
        yieldPerHectare: 5000,
        equipmentRequirements: [
          "tractor",
          "potato_planter",
          "potato_harvester",
          "trailer",
        ],
      },
      {
        name: "beet",
        yieldPerHectare: 3500,
        equipmentRequirements: [
          "tractor",
          "planter",
          "beet_harvester",
          "trailer",
        ],
      },
      {
        name: "cotton",
        yieldPerHectare: 750,
        equipmentRequirements: [
          "tractor",
          "planter",
          "cotton_harvester",
          "semi_trailer",
        ],
      },
      {
        name: "corn",
        yieldPerHectare: 3000,
        equipmentRequirements: ["tractor", "planter", "harvester", "trailer"],
      },
      {
        name: "sunflower",
        yieldPerHectare: 3000,
        equipmentRequirements: ["tractor", "planter", "harvester", "trailer"],
      },
      {
        name: "sugar_cane",
        yieldPerHectare: 5000,
        equipmentRequirements: [
          "tractor",
          "cane_planter",
          "cane_harvester",
          "trailer",
        ],
      },
      {
        name: "poplar",
        yieldPerHectare: 1500,
        equipmentRequirements: [
          "tractor",
          "tree_planter",
          "tree_harvester",
          "trailer",
        ],
      },
      {
        name: "vegetable",
        yieldPerHectare: 2500,
        equipmentRequirements: [
          "tractor",
          "vegetable_planter",
          "vegetable_harvester",
          "trailer",
        ],
      },
      {
        name: "spinach",
        yieldPerHectare: 3000,
        equipmentRequirements: [
          "tractor",
          "planter",
          "spinach_harvester",
          "trailer",
        ],
      },
      {
        name: "pea",
        yieldPerHectare: 7500,
        equipmentRequirements: [
          "tractor",
          "planter",
          "pea_harvester",
          "trailer",
        ],
      },
      {
        name: "green_bean",
        yieldPerHectare: 7500,
        equipmentRequirements: [
          "tractor",
          "planter",
          "bean_harvester",
          "trailer",
        ],
      },
    ];

    await Crop.bulkCreate(crops);
    console.log(`${crops.length} crops created successfully`);

    // 2. Création des équipements
    const equipments = [
      // 5 Tracteurs
      ...Array(5)
        .fill()
        .map((_, i) => ({
          type: "tractor",
          subtype: "standard",
          isAvailable: true,
        })),

      // 3 Remorques standard
      ...Array(3)
        .fill()
        .map((_, i) => ({
          type: "trailer",
          subtype: "standard",
          isAvailable: true,
        })),

      // 2 Moissonneuses-batteuses
      ...Array(2)
        .fill()
        .map((_, i) => ({
          type: "harvester",
          subtype: "standard",
          isAvailable: true,
        })),

      // 2 Charrues
      ...Array(2)
        .fill()
        .map((_, i) => ({
          type: "plow",
          subtype: "standard",
          isAvailable: true,
        })),

      // 2 Fertilisateurs
      ...Array(2)
        .fill()
        .map((_, i) => ({
          type: "fertilizer_spreader",
          subtype: "standard",
          isAvailable: true,
        })),

      // 2 Semeuses
      ...Array(2)
        .fill()
        .map((_, i) => ({
          type: "planter",
          subtype: "standard",
          isAvailable: true,
        })),

      // Équipements spécialisés (1 unité chacun)
      { type: "planter", subtype: "grape", isAvailable: true },
      { type: "harvester", subtype: "grape", isAvailable: true },
      { type: "planter", subtype: "tree", isAvailable: true },
      { type: "harvester", subtype: "olive", isAvailable: true },
      { type: "planter", subtype: "potato", isAvailable: true },
      { type: "harvester", subtype: "potato", isAvailable: true },
      { type: "harvester", subtype: "beet", isAvailable: true },
      { type: "harvester", subtype: "cotton", isAvailable: true },
      { type: "trailer", subtype: "semi", isAvailable: true },
      { type: "planter", subtype: "cane", isAvailable: true },
      { type: "harvester", subtype: "cane", isAvailable: true },
      { type: "harvester", subtype: "tree", isAvailable: true },
      { type: "planter", subtype: "vegetable", isAvailable: true },
      { type: "harvester", subtype: "vegetable", isAvailable: true },
      { type: "harvester", subtype: "spinach", isAvailable: true },
      { type: "harvester", subtype: "pea", isAvailable: true },
      { type: "harvester", subtype: "bean", isAvailable: true },
    ];

    await Equipment.bulkCreate(equipments);
    console.log(`${equipments.length} equipments created successfully`);

    // 3. Création d'une ferme par défaut
    const farm = await Farm.create({ name: "Default Farm" });
    console.log(`Default farm created with ID: ${farm.id}`);

    console.log("Farm initialization completed successfully!");
  } catch (error) {
    console.error("Error during farm initialization:", error);
  } finally {
    await sequelize.close();
  }
}

// Exécuter l'initialisation
initializeFarm();
