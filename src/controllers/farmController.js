const FarmService = require("../services/farmService");

exports.createFarm = async (req, res, next) => {
  try {
    const farm = await FarmService.createFarm();
    res.status(201).json(farm);
  } catch (error) {
    next(error);
  }
};

exports.getFarmStatus = async (req, res, next) => {
  try {
    const { farmId } = req.params;
    const status = await FarmService.getFarmStatus(farmId);
    res.json(status);
  } catch (error) {
    next(error);
  }
};
