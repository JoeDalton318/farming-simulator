const express = require("express");
const router = express.Router();
const WaterController = require("../controllers/waterController");
const errorHandler = require("../middleware/errorHandler");

// Créer un réservoir d'eau
router.post("/", WaterController.createWaterTank);

// Remplir un réservoir d'eau
router.post("/:tankId/refill", WaterController.refillWaterTank);

// Consommer de l'eau
router.post("/:tankId/consume", WaterController.consumeWater);

// Obtenir le niveau d'eau
router.get("/:tankId/level", WaterController.getWaterLevel);

router.use(errorHandler);

module.exports = router; 