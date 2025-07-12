const express = require("express");
const router = express.Router();
const GreenhouseController = require("../controllers/greenhouseController");
const errorHandler = require("../middleware/errorHandler");

// Créer une serre
router.post("/", GreenhouseController.createGreenhouse);

// Activer une serre
router.post("/:greenhouseId/activate", GreenhouseController.activateGreenhouse);

// Produire des fraises
router.post("/:greenhouseId/produce", GreenhouseController.produceStrawberries);

// Vérifier si la serre peut produire
router.get("/:greenhouseId/canProduce", GreenhouseController.canProduce);

router.use(errorHandler);

module.exports = router; 