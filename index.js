const express = require("express");
const { sequelize } = require("./models");
const app = express();
app.use(express.json());

require("dotenv").config();

const connectDb = sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
    return sequelize.sync();
  })
  .then(() => {
    console.log("Database synchronized with models.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Routers
const inventoryRouter = require("./routes/inventory");
app.use("/inventory", inventoryRouter);


async function startServer() {
  await connectDb; 
  app.listen(process.env.PORT, () => {
    console.log("Server started on ", process.env.PORT);
  });
}

startServer();
