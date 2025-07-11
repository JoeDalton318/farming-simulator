const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { sequelize } = require("./models");
const routes = require("./controllers");
const errorHandler = require("./middleware/errorHandler");
const config = require("./config/config");

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan(config.isProduction ? "combined" : "dev"));

// Routes
app.use("/api", routes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Error Handling
app.use(errorHandler);

// Database Connection & Server Start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");

    if (config.isDevelopment) {
      await sequelize.sync({ alter: true });
      console.log("Database synced");
    }

    const PORT = config.port || 3000;
    app.listen(PORT, () => {
      console.log(`Farming Simulator API running on port ${PORT}`);
      console.log(`Environment: ${config.env}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
