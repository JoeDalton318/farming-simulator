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
        include: [{ model: Storage, as: "Storage" }],
        transaction,
      });

      if (!factory || !factory.isOperational) {
        throw new Error("Factory not available");
      }

      if (!factory.Storage) throw new Error("Factory storage not found");
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
    const strategy = FACTORY_STRATEGIES[factoryType];
    if (!strategy) throw new Error("Factory type not supported");
    return strategy.process(inputItems);
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
      quantity: quantities[0] * 18, // Multiplicateur x18 selon le patch
      value:
        (sugar.valuePerUnit +
          flour.valuePerUnit +
          eggs.valuePerUnit +
          butter.valuePerUnit +
          strawberries.valuePerUnit +
          chocolate.valuePerUnit) *
        18, // Multiplicateur x18 selon le patch
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
    const wool = inputItems.find((i) => i.itemType === "wool");
    
    if (!fabric || !wool) {
      throw new Error("Textile workshop requires fabric and wool in equal quantities");
    }
    
    // Vérifier que les quantités sont égales
    if (fabric.quantity !== wool.quantity) {
      throw new Error("Textile workshop requires equal quantities of fabric and wool");
    }
    
    return {
      type: "clothing",
      quantity: fabric.quantity * 4, // Multiplicateur x4 selon le patch
      value: (fabric.valuePerUnit + wool.valuePerUnit) * 4, // Multiplicateur x4
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

// Implémentation du Strategy Pattern pour la transformation en usine
class OilMillStrategy {
  static async process(inputItems) { return FactoryService.processOilMill(inputItems); }
}
class SawmillStrategy {
  static async process(inputItems) { return FactoryService.processSawmill(inputItems); }
}
class SugarRefineryStrategy {
  static async process(inputItems) { return FactoryService.processSugarRefinery(inputItems); }
}
class SpinneryStrategy {
  static async process(inputItems) { return FactoryService.processSpinnery(inputItems); }
}
class BakeryStrategy {
  static async process(inputItems) { return FactoryService.processBakery(inputItems); }
}
class WineryStrategy {
  static async process(inputItems) { return FactoryService.processWinery(inputItems); }
}
class ChipFactoryStrategy {
  static async process(inputItems) { return FactoryService.processChipFactory(inputItems); }
}
class WagonFactoryStrategy {
  static async process(inputItems) { return FactoryService.processWagonFactory(inputItems); }
}
class ToyFactoryStrategy {
  static async process(inputItems) { return FactoryService.processToyFactory(inputItems); }
}
class TextileWorkshopStrategy {
  static async process(inputItems) { return FactoryService.processTextileWorkshop(inputItems); }
}
class ManureFactoryStrategy {
  static async process(inputItems) { return FactoryService.processManureFactory(inputItems); }
}
class DairyStrategy {
  static async process(inputItems) { return FactoryService.processDairy(inputItems); }
}
class ChocolateFactoryStrategy {
  static async process(inputItems) { return FactoryService.processChocolateFactory(inputItems); }
}

const FACTORY_STRATEGIES = {
  oil_mill: OilMillStrategy,
  sawmill: SawmillStrategy,
  sugar_refinery: SugarRefineryStrategy,
  spinnery: SpinneryStrategy,
  bakery: BakeryStrategy,
  winery: WineryStrategy,
  chip_factory: ChipFactoryStrategy,
  wagon_factory: WagonFactoryStrategy,
  toy_factory: ToyFactoryStrategy,
  textile_workshop: TextileWorkshopStrategy,
  manure_factory: ManureFactoryStrategy,
  dairy: DairyStrategy,
  chocolate_factory: ChocolateFactoryStrategy
};

module.exports = FactoryService;
