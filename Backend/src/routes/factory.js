const express = require("express");
const router = express.Router();
const FactoryService = require("../services/factoryService");
const errorHandler = require("../middleware/errorHandler");

// Lister toutes les usines
router.get("/", async (req, res, next) => {
  try {
    const { farmId } = req.query;
    if (!farmId) throw new Error("Farm ID is required");

    const factories = await FactoryService.getAllFactories(farmId);
    res.json({
      success: true,
      data: factories,
    });
  } catch (error) {
    next(error);
  }
});

// Traiter des matières premières
router.post("/:factoryId/process", async (req, res, next) => {
  try {
    const { factoryId } = req.params;
    const { inputItems } = req.body;

    if (!inputItems || !Array.isArray(inputItems)) {
      throw new Error("Input items array is required");
    }

    const output = await FactoryService.processMaterials(factoryId, inputItems);
    res.json({
      success: true,
      data: output,
      message: "Materials processed successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Obtenir les statistiques de production
router.get("/:factoryId/stats", async (req, res, next) => {
  try {
    const { factoryId } = req.params;
    const stats = await FactoryService.getProductionStats(factoryId);
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

// Configurer une usine
router.put("/:factoryId", async (req, res, next) => {
  try {
    const { factoryId } = req.params;
    const { isOperational, processingRate } = req.body;

    const factory = await FactoryService.configureFactory(
      factoryId,
      isOperational,
      processingRate
    );

    res.json({
      success: true,
      data: factory,
      message: "Factory configured successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
