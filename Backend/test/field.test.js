const { Field, Farm, Crop } = require("../src/models");
const fieldService = require("../src/services/fieldService");

describe("Field Service", () => {
  let testFarm;
  let testField;

  beforeAll(async () => {
    // Créer une ferme de test
    testFarm = await Farm.create({
      name: "Test Farm",
      money: 10000,
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    await Field.destroy({ where: { FarmId: testFarm.id } });
    await Farm.destroy({ where: { id: testFarm.id } });
  });

  beforeEach(async () => {
    testField = await Field.create({
      number: 1, // Ajout du champ number obligatoire
      FarmId: testFarm.id,
      size: 1.0, // Ajout du champ size obligatoire
      currentState: "harvested",
    });
  });

  afterEach(async () => {
    if (testField && testField.id) {
      await Field.destroy({ where: { id: testField.id } });
    }
  });

  describe("Plow Field", () => {
    it("should plow a harvested field", async () => {
      const result = await fieldService.plowField(testField.id);
      expect(result.success).toBe(true);
      expect(result.field.state).toBe("plowed");
    });

    it("should not plow a non-harvested field", async () => {
      await testField.update({ state: "plowed" });
      const result = await fieldService.plowField(testField.id);
      expect(result.success).toBe(false);
    });

    it("should take 30 seconds to plow", async () => {
      const startTime = Date.now();
      const result = await fieldService.plowField(testField.id);
      const endTime = Date.now();
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(30000);
    });
  });

  describe("Plant Crop", () => {
    beforeEach(async () => {
      await testField.update({ state: "plowed" });
    });

    it("should plant a valid crop", async () => {
      const result = await fieldService.plantCrop(testField.id, "wheat");
      expect(result.success).toBe(true);
      expect(result.field.cropType).toBe("wheat");
      expect(result.field.state).toBe("seeded");
    });

    it("should not plant on non-plowed field", async () => {
      await testField.update({ state: "harvested" });
      const result = await fieldService.plantCrop(testField.id, "wheat");
      expect(result.success).toBe(false);
    });

    it("should reject invalid crop type", async () => {
      const result = await fieldService.plantCrop(testField.id, "invalid_crop");
      expect(result.success).toBe(false);
    });

    it("should take 30 seconds to plant", async () => {
      const startTime = Date.now();
      const result = await fieldService.plantCrop(testField.id, "wheat");
      const endTime = Date.now();
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(30000);
    });
  });

  describe("Fertilize Field", () => {
    beforeEach(async () => {
      await testField.update({ state: "seeded", cropType: "wheat" });
    });

    it("should fertilize a planted field", async () => {
      const result = await fieldService.fertilizeField(testField.id);
      expect(result.success).toBe(true);
      expect(result.field.fertilized).toBe(true);
      expect(result.field.state).toBe("fertilized");
    });

    it("should not fertilize non-planted field", async () => {
      await testField.update({ state: "plowed" });
      const result = await fieldService.fertilizeField(testField.id);
      expect(result.success).toBe(false);
    });

    it("should take 30 seconds to fertilize", async () => {
      const startTime = Date.now();
      const result = await fieldService.fertilizeField(testField.id);
      const endTime = Date.now();
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(30000);
    });
  });

  describe("Harvest Field", () => {
    beforeEach(async () => {
      await testField.update({
        state: "ready_to_harvest",
        cropType: "wheat",
        fertilized: true,
      });
    });

    it("should harvest a ready field", async () => {
      const result = await fieldService.harvestField(testField.id);
      expect(result.success).toBe(true);
      expect(result.field.state).toBe("harvested");
      expect(result.yield).toBeGreaterThan(0);
    });

    it("should calculate fertilized yield correctly", async () => {
      const result = await fieldService.harvestField(testField.id);
      expect(result.success).toBe(true);
      expect(result.yield).toBeGreaterThan(100); // Fertilized yield should be higher
    });

    it("should not harvest non-ready field", async () => {
      await testField.update({ state: "fertilized" });
      const result = await fieldService.harvestField(testField.id);
      expect(result.success).toBe(false);
    });

    it("should take 30 seconds to harvest", async () => {
      const startTime = Date.now();
      const result = await fieldService.harvestField(testField.id);
      const endTime = Date.now();
      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThanOrEqual(30000);
    });
  });
});

