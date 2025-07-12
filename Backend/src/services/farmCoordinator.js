// FarmCoordinator : Médiateur/Facade pour la coordination globale
const FieldService = require('./fieldService');
const EquipmentService = require('./equipmentService');
const StorageService = require('./storageService');
const FactoryService = require('./factoryService');
const AnimalService = require('./animalService');
const WaterService = require('./waterService');
const GreenhouseService = require('./greenhouseService');

class FarmCoordinator {
  // Exemple : orchestrer une récolte complète
  static async orchestrateHarvest(fieldId) {
    try {
      const field = await FieldService.getFieldStatus(fieldId);
      if (field.state !== 'ready_to_harvest') {
        return { success: false, error: 'Champ non prêt pour la récolte' };
      }
      
      const result = await FieldService.harvestField(fieldId);
      if (result.success) {
        StorageService.getInstance().notify('harvestComplete', { 
          fieldId, 
          yield: result.yield 
        });
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Exemple : orchestrer la production en usine
  static async orchestrateFactoryProcess(factoryId) {
    try {
      // Utiliser des matières premières par défaut pour la boulangerie
      const inputItems = [
        { itemType: 'flour', quantity: 10, valuePerUnit: 10 },
        { itemType: 'sugar', quantity: 10, valuePerUnit: 15 },
        { itemType: 'eggs', quantity: 10, valuePerUnit: 5 }
      ];
      
      const result = await FactoryService.processMaterials(factoryId, inputItems);
      StorageService.getInstance().notify('factoryProcess', { factoryId, result });
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Exemple : orchestrer la collecte de produits animaux
  static async orchestrateAnimalProductCollection(animalId, waterTankId) {
    try {
      const products = await AnimalService.collectProducts(animalId, waterTankId);
      StorageService.getInstance().notify('animalProduct', { animalId, products });
      return { success: true, products };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Exemple : orchestrer la production en serre
  static async orchestrateGreenhouseProduction(greenhouseId, waterTankId) {
    try {
      const result = await GreenhouseService.produceStrawberries(greenhouseId, waterTankId);
      StorageService.getInstance().notify('greenhouseProduction', { greenhouseId, result });
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = FarmCoordinator; 