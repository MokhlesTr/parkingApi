const express = require("express");
const app = express();
const agentsRouter = require("./routes/agentRoutes");

app.use(express.json());

app.get("/", (req, res) => {
  console.log("It's running!");
  res.status(200).json("It's running!");
});

app.use("/agent", agentsRouter);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
