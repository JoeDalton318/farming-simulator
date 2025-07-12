const StorageService = require("../services/storageService");
const errorHandler = require("../middleware/errorHandler");

class StorageController {
  static async getStorageContent(req, res, next) {
    try {
      const { storageId } = req.params;
      const storage = await StorageService.getStorageContent(storageId);
      res.json({
        success: true,
        data: storage,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req, res, next) {
    try {
      const { storageId } = req.params;
      const { itemType, quantity, valuePerUnit } = req.body;

      if (!itemType || !quantity) {
        throw new Error("Item type and quantity are required");
      }

      const item = await StorageService.addItem(
        storageId,
        itemType,
        quantity,
        valuePerUnit
      );

      res.status(201).json({
        success: true,
        data: item,
        message: "Item added to storage",
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req, res, next) {
    try {
      const { storageId, itemId } = req.params;
      const { quantity } = req.body;

      await StorageService.removeItem(storageId, itemId, quantity);
      res.json({
        success: true,
        message: "Item removed from storage",
      });
    } catch (error) {
      next(error);
    }
  }

  static async sellItem(req, res, next) {
    try {
      const { storageId, itemId } = req.params;
      const { quantity } = req.body;

      const result = await StorageService.sellItem(storageId, itemId, quantity);
      res.json({
        success: true,
        data: result,
        message: "Item sold successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCapacity(req, res, next) {
    try {
      const { storageId } = req.params;
      const capacity = await StorageService.getAvailableCapacity(storageId);
      res.json({
        success: true,
        data: capacity,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StorageController;
