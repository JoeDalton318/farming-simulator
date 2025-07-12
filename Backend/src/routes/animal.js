const express = require("express");
const router = express.Router();
const AnimalController = require("../controllers/animalController");
const errorHandler = require("../middleware/errorHandler");

// Créer un animal
router.post("/", AnimalController.createAnimal);

// Nourrir un animal
router.post("/:animalId/feed", AnimalController.feedAnimal);

// Collecter les produits d'un animal
router.post("/:animalId/collect", AnimalController.collectProducts);

// Vérifier la santé d'un animal
router.get("/:animalId/health", AnimalController.checkAnimalHealth);

// Nourrir tous les animaux d'une ferme
router.post("/farm/:farmId/feedAll", AnimalController.feedAllAnimals);

router.use(errorHandler);

module.exports = router; 