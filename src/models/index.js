const { Sequelize, DataTypes } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  }
);

const models = {
  Field: require("./field")(sequelize, DataTypes),
  Crop: require("./crop")(sequelize, DataTypes),
  Equipment: require("./equipment")(sequelize, DataTypes),
  Storage: require("./storage")(sequelize, DataTypes),
  StorageItem: require("./storageItem")(sequelize, DataTypes),
  Factory: require("./factory")(sequelize, DataTypes),
  Transaction: require("./transaction")(sequelize, DataTypes),
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models); // Pass the entire models object for associations
  }
});

module.exports = {
  sequelize,
  ...models,
};
