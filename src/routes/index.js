const express = require("express");
const router = express.Router();

// Import des routeurs
const farmRouter = require("./farm");
const fieldRouter = require("./field");
const storageRouter = require("./storage");
const factoryRouter = require("./factory");

// Montage des routeurs
router.use("/farm", farmRouter);
router.use("/field", fieldRouter);
router.use("/storage", storageRouter);
router.use("/factory", factoryRouter);

module.exports = router;
