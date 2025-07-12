const express = require("express");
const router = express.Router();
const StorageService = require("../services/storageService");
const errorHandler = require("../middleware/errorHandler");

// Obtenir le contenu du stockage
router.get("/:storageId", async (req, res, next) => {
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
});

// Ajouter un item au stockage (manuellement)
router.post("/:storageId/items", async (req, res, next) => {
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
      valuePerUnit || 1
    );

    res.status(201).json({
      success: true,
      data: item,
      message: "Item added to storage",
    });
  } catch (error) {
    next(error);
  }
});

// Supprimer un item du stockage
router.delete("/:storageId/items/:itemId", async (req, res, next) => {
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
});

// Vérifier la capacité disponible
router.get("/:storageId/capacity", async (req, res, next) => {
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
});

module.exports = router;
