const { sequelize, Field, Farm, Crop, Equipment } = require("../models");
const FieldService = require("../services/fieldService");

describe("Field Service", () => {
  let testFarm;
  let testField;
  let testCrop;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Initialisation des données de test
    testFarm = await Farm.create({});
    testCrop = await Crop.create({
      name: "wheat",
      yieldPerHectare: 1000,
      equipmentRequirements: ["tractor", "planter", "harvester", "trailer"],
    });

    // Création des équipements nécessaires
    await Equipment.bulkCreate([
      { type: "tractor", subtype: "standard", isAvailable: true },
      { type: "planter", subtype: "standard", isAvailable: true },
      { type: "harvester", subtype: "standard", isAvailable: true },
      { type: "trailer", subtype: "standard", isAvailable: true },
    ]);
  });

  beforeEach(async () => {
    testField = await Field.create({
      FarmId: testFarm.id,
      size: 1.0,
      currentState: "harvested",
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe("Plow Field", () => {
    test("should plow a harvested field", async () => {
      const field = await FieldService.plowField(testField.id);
      expect(field.currentState).toBe("plowed");
    });

    test("should not plow a non-harvested field", async () => {
      await testField.update({ currentState: "plowed" });
      await expect(FieldService.plowField(testField.id)).rejects.toThrow(
        "Field must be harvested before plowing"
      );
    });

    test("should take 30 seconds to plow", async () => {
      const start = Date.now();
      await FieldService.plowField(testField.id);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(30000);
    }, 35000); // Timeout étendu pour le test
  });

  describe("Plant Crop", () => {
    beforeEach(async () => {
      await testField.update({ currentState: "plowed" });
    });

    test("should plant a valid crop", async () => {
      const field = await FieldService.plantCrop(testField.id, "wheat");
      expect(field.currentState).toBe("planted");
      expect(field.currentCropType).toBe("wheat");
    });

    test("should not plant on non-plowed field", async () => {
      await testField.update({ currentState: "harvested" });
      await expect(
        FieldService.plantCrop(testField.id, "wheat")
      ).rejects.toThrow("Field must be plowed before planting");
    });

    test("should reject invalid crop type", async () => {
      await expect(
        FieldService.plantCrop(testField.id, "invalid_crop")
      ).rejects.toThrow("Crop type not supported");
    });

    test("should take 30 seconds to plant", async () => {
      const start = Date.now();
      await FieldService.plantCrop(testField.id, "wheat");
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(30000);
    }, 35000);
  });

  describe("Fertilize Field", () => {
    beforeEach(async () => {
      await testField.update({
        currentState: "planted",
        currentCropType: "wheat",
      });
    });

    test("should fertilize a planted field", async () => {
      const field = await FieldService.fertilizeField(testField.id);
      expect(field.isFertilized).toBe(true);
    });

    test("should not fertilize non-planted field", async () => {
      await testField.update({ currentState: "plowed" });
      await expect(FieldService.fertilizeField(testField.id)).rejects.toThrow(
        "Field must be planted before fertilizing"
      );
    });

    test("should take 30 seconds to fertilize", async () => {
      const start = Date.now();
      await FieldService.fertilizeField(testField.id);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(30000);
    }, 35000);
  });

  describe("Harvest Field", () => {
    beforeEach(async () => {
      await testField.update({
        currentState: "ready_to_harvest",
        currentCropType: "wheat",
        isFertilized: false,
      });
    });

    test("should harvest a ready field", async () => {
      const yieldAmount = await FieldService.harvestField(testField.id);
      expect(yieldAmount).toBe(1000); // Rendement de base du blé

      const updatedField = await Field.findByPk(testField.id);
      expect(updatedField.currentState).toBe("harvested");
      expect(updatedField.currentCropType).toBeNull();
      expect(updatedField.isFertilized).toBe(false);
    });

    test("should calculate fertilized yield correctly", async () => {
      await testField.update({ isFertilized: true });
      const yieldAmount = await FieldService.harvestField(testField.id);
      expect(yieldAmount).toBe(1500); // 1000 * 1.5
    });

    test("should not harvest non-ready field", async () => {
      await testField.update({ currentState: "planted" });
      await expect(FieldService.harvestField(testField.id)).rejects.toThrow(
        "Field is not ready for harvest"
      );
    });

    test("should take 30 seconds to harvest", async () => {
      const start = Date.now();
      await FieldService.harvestField(testField.id);
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(30000);
    }, 35000);
  });
});
