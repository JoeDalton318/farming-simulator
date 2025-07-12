const FieldService = require("../services/fieldService");
const errorHandler = require("../middleware/errorHandler");

class FieldController {
  static async createField(req, res, next) {
    try {
      const { farmId } = req.body;
      if (!farmId) throw new Error("Farm ID is required");

      const field = await FieldService.createField(farmId);
      res.status(201).json({
        success: true,
        data: field,
        message: "Field created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async plowField(req, res, next) {
    try {
      const { fieldId } = req.params;
      const field = await FieldService.plowField(fieldId);
      res.json({
        success: true,
        data: field,
        message: "Field plowed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async plantCrop(req, res, next) {
    try {
      const { fieldId } = req.params;
      const { cropType } = req.body;

      if (!cropType) throw new Error("Crop type is required");

      const field = await FieldService.plantCrop(fieldId, cropType);
      res.json({
        success: true,
        data: field,
        message: "Crop planted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async fertilizeField(req, res, next) {
    try {
      const { fieldId } = req.params;
      const field = await FieldService.fertilizeField(fieldId);
      res.json({
        success: true,
        data: field,
        message: "Field fertilized successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async harvestField(req, res, next) {
    try {
      const { fieldId } = req.params;
      const yieldAmount = await FieldService.harvestField(fieldId);
      res.json({
        success: true,
        data: { yield: yieldAmount },
        message: "Field harvested successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFieldStatus(req, res, next) {
    try {
      const { fieldId } = req.params;
      const status = await FieldService.getFieldStatus(fieldId);
      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FieldController;
