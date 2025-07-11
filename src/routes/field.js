const express = require("express");
const router = express.Router();
const FieldService = require("../services/fieldService");
const errorHandler = require("../middleware/errorHandler");

// Créer un nouveau champ
router.post("/", async (req, res, next) => {
  try {
    const { farmId } = req.body;
    if (!farmId) throw new Error("Farm ID is required");
    
    const field = await FieldService.createField(farmId);
    res.status(201).json({
      success: true,
      data: field,
      message: "Field created successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Labourer un champ
router.post("/:fieldId/plow", async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const field = await FieldService.plowField(fieldId);
    res.json({
      success: true,
      data: field,
      message: "Field plowed successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Planter une culture
router.post("/:fieldId/plant", async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const { cropType } = req.body;
    
    if (!cropType) throw new Error("Crop type is required");
    
    const field = await FieldService.plantCrop(fieldId, cropType);
    res.json({
      success: true,
      data: field,
      message: "Crop planted successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Fertiliser un champ
router.post("/:fieldId/fertilize", async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const field = await FieldService.fertilizeField(fieldId);
    res.json({
      success: true,
      data: field,
      message: "Field fertilized successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Récolter un champ
router.post("/:fieldId/harvest", async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const yieldAmount = await FieldService.harvestField(fieldId);
    res.json({
      success: true,
      data: { yield: yieldAmount },
      message: "Field harvested successfully"
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir l'état d'un champ
router.get("/:fieldId", async (req, res, next) => {
  try {
    const { fieldId } = req.params;
    const status = await FieldService.getFieldStatus(fieldId);
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;