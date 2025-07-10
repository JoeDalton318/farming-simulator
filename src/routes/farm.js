const express = require("express");
const router = express.Router();
const FarmService = require("../services/farm");

// Créer une nouvelle ferme
router.post("/", async (req, res) => {
  try {
    const farm = await FarmService.createFarm();
    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vendre un item du stockage
router.post("/:farmId/storage/sell", async (req, res) => {
  try {
    const { farmId } = req.params;
    const { itemId, quantity } = req.body;

    const totalValue = await FarmService.sellItem(farmId, itemId, quantity);
    res.json({ success: true, totalValue });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Autres routes à implémenter...

module.exports = router;
