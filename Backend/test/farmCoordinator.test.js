const { 
  Farm, 
  Field, 
  Factory, 
  Storage, 
  Animal, 
  WaterTank, 
  Greenhouse,
  Crop,
  FieldHistory
} = require("../src/models");
const FarmCoordinator = require("../src/services/farmCoordinator");
const StorageService = require("../src/services/storageService");

describe("FarmCoordinator (Médiateur/Facade)", () => {
  let testFarm;
  let testField;
  let testFactory;
  let testStorage;
  let testAnimal;
  let testWaterTank;
  let testGreenhouse;
  let testCrop;

  beforeAll(async () => {
    // Créer une ferme de test
    testFarm = await Farm.create({
      name: "Test Farm",
      money: 10000,
    });

    // Créer un stockage pour la ferme
    testStorage = await Storage.create({
      FarmId: testFarm.id,
      capacity: 100000,
      currentVolume: 0,
    });

    // Créer une cuve d'eau pour la ferme
    testWaterTank = await WaterTank.create({
      FarmId: testFarm.id,
      capacity: 10000,
      currentVolume: 5000,
    });

    // Créer une culture de test
    testCrop = await Crop.create({
      name: "wheat",
      yieldPerHectare: 1000,
      growthTime: 2, // 2 minutes
      equipmentRequirements: ["tractor", "planter", "harvester"], // Ajout obligatoire
    });

    // Créer un champ de test
    testField = await Field.create({
      number: 1,
      FarmId: testFarm.id,
      size: 1.0, // Ajout du champ size obligatoire
      state: "ready_to_harvest",
      cropType: "wheat",
      fertilized: true,
      lastActionTime: new Date(),
    });

    // Créer une usine de test
    testFactory = await Factory.create({
      FarmId: testFarm.id,
      StorageId: testStorage.id,
      type: "bakery",
      isOperational: true,
      processingRate: 100,
    });

    // Créer un animal de test
    testAnimal = await Animal.create({
      FarmId: testFarm.id,
      type: "cow",
      health: 100,
      lastFed: new Date(),
      lastMilked: new Date(),
    });

    // Créer une serre de test
    testGreenhouse = await Greenhouse.create({
      FarmId: testFarm.id,
      type: "strawberry",
      isOperational: true,
      waterConsumptionRate: 10,
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (testField && testField.id) await FieldHistory.destroy({ where: { FieldId: testField.id } });
    if (testField && testField.id) await Field.destroy({ where: { id: testField.id } });
    if (testFactory && testFactory.id) await Factory.destroy({ where: { id: testFactory.id } });
    if (testStorage && testStorage.id) await Storage.destroy({ where: { id: testStorage.id } });
    if (testAnimal && testAnimal.id) await Animal.destroy({ where: { id: testAnimal.id } });
    if (testWaterTank && testWaterTank.id) await WaterTank.destroy({ where: { id: testWaterTank.id } });
    if (testGreenhouse && testGreenhouse.id) await Greenhouse.destroy({ where: { id: testGreenhouse.id } });
    if (testCrop && testCrop.id) await Crop.destroy({ where: { id: testCrop.id } });
    if (testFarm && testFarm.id) await Farm.destroy({ where: { id: testFarm.id } });
  });

  it('orchestrateHarvest doit effectuer une récolte complète', async () => {
    const result = await FarmCoordinator.orchestrateHarvest(testField.id);
    expect(result.success).toBe(true);
    expect(result.field.state).toBe("harvested");
  });

  it('orchestrateFactoryProcess doit transformer des matières', async () => {
    // Ajouter des matières premières au stockage
    await StorageService.addItem(testStorage.id, "flour", 100, 10);
    await StorageService.addItem(testStorage.id, "sugar", 50, 15);
    await StorageService.addItem(testStorage.id, "eggs", 20, 5);

    const result = await FarmCoordinator.orchestrateFactoryProcess(testFactory.id);
    expect(result.success).toBe(true);
  });

  it('orchestrateAnimalProductCollection doit collecter des produits animaux', async () => {
    const result = await FarmCoordinator.orchestrateAnimalProductCollection(testAnimal.id, testWaterTank.id);
    expect(result.success).toBe(true);
  });

  it('orchestrateGreenhouseProduction doit produire en serre', async () => {
    const result = await FarmCoordinator.orchestrateGreenhouseProduction(testGreenhouse.id, testWaterTank.id);
    expect(result.success).toBe(true);
  });

  it('doit notifier les observateurs du stockage', done => {
    const storageService = StorageService.getInstance();
    storageService.subscribe((event, data) => {
      if (event === 'harvestComplete') {
        expect(data.fieldId).toBe(testField.id);
        expect(data.yield).toBeGreaterThan(0);
        storageService.unsubscribe();
        done();
      }
    });

    // Déclencher une récolte pour tester la notification
    FarmCoordinator.orchestrateHarvest(testField.id).catch(done);
  }, 10000); // Timeout augmenté à 10 secondes
}); 