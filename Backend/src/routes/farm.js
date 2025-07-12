const express = require("express");
const router = express.Router();
const FarmService = require("../services/farmService");
const errorHandler = require("../middleware/errorHandler");

// Créer une nouvelle ferme
router.post("/", async (req, res, next) => {
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
});

// Obtenir les informations de la ferme
router.get("/:farmId", async (req, res, next) => {
  try {
    const { farmId } = req.params;
    const farm = await FarmService.getFarmStatus(farmId);
    res.json({
      success: true,
      data: farm,
    });
  } catch (error) {
    next(error);
  }
});

// Lister toutes les fermes
router.get("/", async (req, res, next) => {
  try {
    const farms = await FarmService.getAllFarms();
    res.json({
      success: true,
      data: farms
    });
  } catch (error) {
    next(error);
  }
});

// Vendre un item du stockage
router.post("/:farmId/storage/sell", async (req, res, next) => {
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
});

// Gérer les finances de la ferme
router.get("/:farmId/finances", async (req, res, next) => {
  try {
    const { farmId } = req.params;
    const finances = await FarmService.getFinancialReport(farmId);
    res.json({
      success: true,
      data: finances,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
