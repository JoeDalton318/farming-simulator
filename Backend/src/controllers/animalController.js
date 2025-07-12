const AnimalService = require("../services/animalService");

class AnimalController {
  static async createAnimal(req, res, next) {
    try {
      const { farmId, type, name } = req.body;
      const animal = await AnimalService.createAnimal(farmId, type, name);
      res.status(201).json({
        success: true,
        data: animal,
        message: "Animal created successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async feedAnimal(req, res, next) {
    try {
      const { animalId } = req.params;
      const { grassAmount } = req.body;
      const animal = await AnimalService.feedAnimal(animalId, grassAmount);
      res.json({
        success: true,
        data: animal,
        message: "Animal fed successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async collectProducts(req, res, next) {
    try {
      const { animalId } = req.params;
      const { waterTankId } = req.body;
      const products = await AnimalService.collectProducts(animalId, waterTankId);
      res.json({
        success: true,
        data: products,
        message: "Products collected successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkAnimalHealth(req, res, next) {
    try {
      const { animalId } = req.params;
      const health = await AnimalService.checkAnimalHealth(animalId);
      res.json({
        success: true,
        data: health
      });
    } catch (error) {
      next(error);
    }
  }

  static async feedAllAnimals(req, res, next) {
    try {
      const { farmId } = req.params;
      const { grassAmount } = req.body;
      const results = await AnimalService.feedAllAnimals(farmId, grassAmount);
      res.json({
        success: true,
        data: results,
        message: "All animals fed successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnimalController; 