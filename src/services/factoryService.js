const { Factory, Storage, StorageItem, sequelize } = require("../models");
const { Op } = require("sequelize");

class FactoryService {
  static async getAllFactories(farmId) {
    return Factory.findAll({
      where: { FarmId: farmId },
      include: [
        {
          model: Storage,
          include: [StorageItem],
        },
      ],
    });
  }

  static async processMaterials(factoryId, inputItems) {
    const transaction = await sequelize.transaction();
    try {
      const factory = await Factory.findByPk(factoryId, {
        include: [Storage],
        transaction,
      });

      if (!factory || !factory.isOperational) {
        throw new Error("Factory not available");
      }

      // Vérifier capacité de stockage disponible
      if (factory.Storage.currentVolume >= factory.Storage.capacity) {
        throw new Error("Storage is full, cannot process");
      }

      // Vérifier les intrants
      const storageItems = await this.checkInputItems(
        factory.Storage.id,
        inputItems,
        transaction
      );

      // Calculer le temps de traitement
      const processingTime = this.calculateProcessingTime(
        inputItems,
        factory.processingRate
      );

      // Traiter avec le temps calculé
      const output = await this.processByFactoryType(
        factory.type,
        storageItems,
        processingTime,
        transaction
      );

      // Vérifier capacité de stockage pour le résultat
      if (
        factory.Storage.currentVolume + output.quantity >
        factory.Storage.capacity
      ) {
        throw new Error("Not enough storage space for output");
      }

      // Créer l'item de sortie
      await StorageItem.create(
        {
          StorageId: factory.Storage.id,
          itemType: output.type,
          quantity: output.quantity,
          valuePerUnit: output.value,
        },
        { transaction }
      );

      // Mettre à jour le volume
      await factory.Storage.update(
        {
          currentVolume: sequelize.literal(
            `currentVolume + ${output.quantity}`
          ),
        },
        { transaction }
      );

      await transaction.commit();

      return {
        ...output,
        processingTime,
        factoryId: factory.id,
        factoryType: factory.type,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async processByFactoryType(factoryType, inputItems, processingTime) {
    // Simuler le temps de traitement réel
    await new Promise((resolve) => setTimeout(resolve, processingTime * 1000));

    switch (factoryType) {
      case "oil_mill":
        return this.processOilMill(inputItems);
      case "sawmill":
        return this.processSawmill(inputItems);
      case "sugar_refinery":
        return this.processSugarRefinery(inputItems);
      case "spinnery":
        return this.processSpinnery(inputItems);
      case "bakery":
        return this.processBakery(inputItems);
      case "winery":
        return this.processWinery(inputItems);
      case "chip_factory":
        return this.processChipFactory(inputItems);
      case "wagon_factory":
        return this.processWagonFactory(inputItems);
      case "toy_factory":
        return this.processToyFactory(inputItems);
      case "textile_workshop":
        return this.processTextileWorkshop(inputItems);
      case "manure_factory":
        return this.processManureFactory(inputItems);
      case "dairy":
        return this.processDairy(inputItems);
      case "chocolate_factory":
        return this.processChocolateFactory(inputItems);
      default:
        throw new Error("Factory type not supported");
    }
  }

  // Méthodes spécifiques pour chaque usine
  static async processOilMill(inputItems) {
    const validInputs = ["sunflower", "olive", "canola"];
    const input = inputItems.find((i) => validInputs.includes(i.itemType));
    if (!input) throw new Error("Invalid input for oil mill");

    return {
      type: "oil",
      quantity: input.quantity,
      value: input.valuePerUnit * 2, // Multiplicateur x2
    };
  }

  static async processSawmill(inputItems) {
    const input = inputItems.find((i) => i.itemType === "poplar");
    if (!input) throw new Error("Invalid input for sawmill");

    return {
      type: "plank",
      quantity: input.quantity,
      value: input.valuePerUnit * 2, // Multiplicateur x2
    };
  }

  static async processSugarRefinery(inputItems) {
    const beet = inputItems.find((i) => i.itemType === "beet");
    const cane = inputItems.find((i) => i.itemType === "cane");
    if (!beet && !cane) {
      throw new Error("Sugar refinery requires beet or cane");
    }
    const quantity = beet ? beet.quantity : cane.quantity;
    return {
      type: "sugar",
      quantity,
      value: (beet ? beet.valuePerUnit : cane.valuePerUnit) * 2, // Multiplicateur x2
    };
  }

  static async processSpinnery(inputItems) {
    const input = inputItems.find((i) => i.itemType === "cotton");
    if (!input) throw new Error("Invalid input for spinnery");
    return {
      type: "yarn",
      quantity: input.quantity,
      value: input.valuePerUnit * 2, // Multiplicateur x2
    };
  }

  static async processBakery(inputItems) {
    //Nouvelle méthode en focntion du patch note
    const sugar = inputItems.find((i) => i.itemType === "sugar");
    const flour = inputItems.find((i) => i.itemType === "flour");
    const eggs = inputItems.find((i) => i.itemType === "eggs");
    const butter = inputItems.find((i) => i.itemType === "butter");
    const strawberries = inputItems.find((i) => i.itemType === "strawberry");
    const chocolate = inputItems.find((i) => i.itemType === "chocolate");

    // Vérifiez que tous les ingrédients sont présents en quantités égales
    const quantities = [sugar, flour, eggs, butter, strawberries, chocolate]
      .filter(Boolean)
      .map((i) => i.quantity);

    if (new Set(quantities).size !== 1) {
      throw new Error("Bakery requires equal quantities of all ingredients");
    }

    return {
      type: "cake",
      quantity: quantities[0], // 1:1 ratio
      value:
        (sugar.valuePerUnit +
          flour.valuePerUnit +
          eggs.valuePerUnit +
          butter.valuePerUnit +
          strawberries.valuePerUnit +
          chocolate.valuePerUnit) *
        3, // x18 au total
    };
  }

  static async processWinery(inputItems) {
    const input = inputItems.find((i) => i.itemType === "grape");
    if (!input) throw new Error("Invalid input for winery");
    return {
      type: "wine",
      quantity: input.quantity,
      value: input.valuePerUnit * 2, // Multiplicateur x2
    };
  }

  static async processChipFactory(inputItems) {
    const potato = inputItems.find((i) => i.itemType === "potato");
    const oil = inputItems.find((i) => i.itemType === "oil");
    if (!potato || !oil) {
      throw new Error("Chip factory requires potato and oil");
    }
    return {
      type: "chips",
      quantity: Math.min(potato.quantity, oil.quantity) * 6, // 1:1 ratio
      value: (potato.valuePerUnit + oil.valuePerUnit) * 6, // Multiplicateur x6
    };
  }

  static async processWagonFactory(inputItems) {
    const wood = inputItems.find((i) => i.itemType === "wood");
    if (!wood) throw new Error("Invalid input for wagon factory");
    return {
      type: "wagon",
      quantity: wood.quantity * 4, // Multiplicateur x4
      value: wood.valuePerUnit * 4, // Multiplicateur x4
    };
  }

  static async processToyFactory(inputItems) {
    const wood = inputItems.find((i) => i.itemType === "wood");
    const fabric = inputItems.find((i) => i.itemType === "fabric");
    if (!wood || !fabric) {
      throw new Error("Toy factory requires wood and fabric");
    }
    return {
      type: "toy",
      quantity: Math.min(wood.quantity, fabric.quantity) * 3, // 1:1 ratio
      value: (wood.valuePerUnit + fabric.valuePerUnit) * 3, // Multiplicateur x3
    };
  }

  static async processTextileWorkshop(inputItems) {
    const fabric = inputItems.find((i) => i.itemType === "fabric");
    if (!fabric) throw new Error("Invalid input for textile workshop");
    return {
      type: "clothing",
      quantity: fabric.quantity * 2, // Multiplicateur x2
      value: fabric.valuePerUnit * 2, // Multiplicateur x2
    };
  }

  static async processManureFactory(inputItems) {
    const manure = inputItems.find((i) => i.itemType === "manure");
    if (!manure) throw new Error("Manure factory requires manure");

    return {
      type: "fertilizer",
      quantity: manure.quantity * 2, // Multiplicateur x2
      value: manure.valuePerUnit * 2,
    };
  }

  static async processDairy(inputItems) {
    const milk = inputItems.find((i) => i.itemType === "milk");
    if (!milk) throw new Error("Dairy requires milk");

    return {
      type: "butter",
      quantity: milk.quantity, // 1:1 ratio
      value: milk.valuePerUnit * 1,
    };
  }

  static async processChocolateFactory(inputItems) {
    const cacao = inputItems.find((i) => i.itemType === "cacao");
    const sugar = inputItems.find((i) => i.itemType === "sugar");
    const milk = inputItems.find((i) => i.itemType === "milk");

    if (!cacao || !sugar || !milk) {
      throw new Error("Chocolate factory requires cacao, sugar and milk");
    }

    const minQuantity = Math.min(cacao.quantity, sugar.quantity, milk.quantity);
    return {
      type: "chocolate",
      quantity: minQuantity * 2, // Multiplicateur x2
      value: (cacao.valuePerUnit + sugar.valuePerUnit + milk.valuePerUnit) * 2,
    };
  }
}

module.exports = FactoryService;
