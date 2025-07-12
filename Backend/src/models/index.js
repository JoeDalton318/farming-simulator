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
    dialect: "postgres",
    logging: false,
  }
);

// Chargez d'abord tous les modèles
const modelDefiners = [
  require('./farm'), // Doit être chargé en premier
  require('./crop'),
  require('./field'), // Après Farm et Crop
  require('./fieldHistory'), // Après Field
  require('./equipment'),
  require('./storage'),
  require('./storageItem'),
  require('./factory'),
  require('./animal'), // Nouveaux modèles du patch
  require('./greenhouse'),
  require('./waterTank'),
  require('./warehouse')
];

// Définissez les modèles
for (const definer of modelDefiners) {
  definer(sequelize, DataTypes);
}

// Ensuite, établissez les associations
const models = sequelize.models;

Object.keys(models).forEach((modelName) => {
  if (typeof models[modelName].associate === "function") {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};
