const express = require("express");
const router = express.Router();
const EquipmentService = require("../services/equipmentService");
const errorHandler = require("../middleware/errorHandler");

// Lister tous les équipements
router.get("/", async (req, res, next) => {
  try {
    const { farmId } = req.query;
    if (!farmId) throw new Error("Farm ID is required");

    const equipment = await EquipmentService.getAllEquipment(farmId);
    res.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    next(error);
  }
});

// Réserver un équipement
router.post("/:equipmentId/reserve", async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const { fieldId, duration } = req.body;

    const equipment = await EquipmentService.reserveEquipment(
      equipmentId,
      fieldId,
      duration
    );

    res.json({
      success: true,
      data: equipment,
      message: "Equipment reserved successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Libérer un équipement
router.post("/:equipmentId/release", async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const equipment = await EquipmentService.releaseEquipment(equipmentId);
    res.json({
      success: true,
      data: equipment,
      message: "Equipment released successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Effectuer la maintenance
router.post("/:equipmentId/maintenance", async (req, res, next) => {
  try {
    const { equipmentId } = req.params;
    const equipment = await EquipmentService.performMaintenance(equipmentId);
    res.json({
      success: true,
      data: equipment,
      message: "Maintenance performed successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
