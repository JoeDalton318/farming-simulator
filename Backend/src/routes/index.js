const express = require("express");
const router = express.Router();
const farmRouter = require("./farm");
const fieldRouter = require("./field");
const storageRouter = require("./storage");
const factoryRouter = require("./factory");
const equipmentRouter = require("./equipment");
const animalRouter = require("./animal");
const waterRouter = require("./water");
const greenhouseRouter = require("./greenhouse");

// Versioning API
const apiVersion = process.env.API_VERSION || 'v1';

// Montage des routeurs avec versioning
router.use(`/api/${apiVersion}/farm`, farmRouter);
router.use(`/api/${apiVersion}/field`, fieldRouter);
router.use(`/api/${apiVersion}/storage`, storageRouter);
router.use(`/api/${apiVersion}/factory`, factoryRouter);
router.use(`/api/${apiVersion}/equipment`, equipmentRouter);
router.use(`/api/${apiVersion}/animal`, animalRouter);
router.use(`/api/${apiVersion}/water`, waterRouter);
router.use(`/api/${apiVersion}/greenhouse`, greenhouseRouter);

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    version: apiVersion,
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;