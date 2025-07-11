const express = require("express");
const router = express.Router();
const FarmController = require("./farmController");
const FieldController = require("./fieldController");
const StorageController = require("./storageController");
const FactoryController = require("./factoryController");

// Farm routes
router.post("/farms", FarmController.createFarm);
router.get("/farms/:farmId", FarmController.getFarmStatus);
router.get("/farms/:farmId/finances", FarmController.getFinancialReport);
router.post("/farms/:farmId/storage/sell", FarmController.sellItem);

// Field routes
router.post("/fields", FieldController.createField);
router.post("/fields/:fieldId/plow", FieldController.plowField);
router.post("/fields/:fieldId/plant", FieldController.plantCrop);
router.post("/fields/:fieldId/fertilize", FieldController.fertilizeField);
router.post("/fields/:fieldId/harvest", FieldController.harvestField);
router.get("/fields/:fieldId", FieldController.getFieldStatus);

// Storage routes
router.get("/storage/:storageId", StorageController.getStorageContent);
router.post("/storage/:storageId/items", StorageController.addItem);
router.delete(
  "/storage/:storageId/items/:itemId",
  StorageController.removeItem
);
router.post(
  "/storage/:storageId/items/:itemId/sell",
  StorageController.sellItem
);
router.get("/storage/:storageId/capacity", StorageController.getCapacity);

// Factory routes
router.get("/factories", FactoryController.getAllFactories);
router.post(
  "/factories/:factoryId/process",
  FactoryController.processMaterials
);
router.get("/factories/:factoryId/stats", FactoryController.getProductionStats);
router.put("/factories/:factoryId", FactoryController.configureFactory);

module.exports = router;
