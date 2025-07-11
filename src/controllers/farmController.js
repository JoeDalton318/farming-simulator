const FarmService = require("../services/farmService");
const FieldService = require("../services/fieldService");
const StorageService = require("../services/storageService");
const FactoryService = require("../services/factoryService");
const errorHandler = require("../middleware/errorHandler");

class FarmController {
  static async createFarm(req, res, next) {
    try {
      const farm = await FarmService.createFarm();
      res.status(201).json({
        success: true,
        data: farm,
        message: "Farm created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFarmStatus(req, res, next) {
    try {
      const { farmId } = req.params;
      const status = await FarmService.getFarmStatus(farmId);
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  static async sellItem(req, res, next) {
    try {
      const { farmId } = req.params;
      const { itemId, quantity } = req.body;

      if (!itemId || !quantity) {
        throw new Error("Item ID and quantity are required");
      }

      const result = await FarmService.sellItem(farmId, itemId, quantity);
      res.json({
        success: true,
        data: result,
        message: "Items sold successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFinancialReport(req, res, next) {
    try {
      const { farmId } = req.params;
      const report = await FarmService.getFinancialReport(farmId);
      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  static async processMaterials(req, res, next) {
    try {
      const { factoryId } = req.params;
      const { inputItems } = req.body;

      if (!inputItems || !Array.isArray(inputItems)) {
        throw new Error("Input items array is required");
      }

      const result = await FactoryService.processMaterials(
        factoryId,
        inputItems
      );
      res.json({
        success: true,
        data: result,
        message: "Materials processed successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FarmController;
