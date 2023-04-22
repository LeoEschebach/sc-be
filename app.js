const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const decisionRoutes = require("./routes/decision");
const problemRoutes = require("./routes/problem");
const objectiveRoutes = require("./routes/objective");
const riskRoutes = require("./routes/risk");
const alternativeRoutes = require("./routes/alternative");
const consequenceRoutes = require("./routes/consequence");
// const authRoutes = require("./routes/auth");
const db = require("./db");

const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  // Set CORS headers so that the React SPA is able to communicate with this server
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use("/api/decision", decisionRoutes);
app.use("/api/problem", problemRoutes);
app.use("/api/objective", objectiveRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/alternative", alternativeRoutes);
app.use("/api/consequence", consequenceRoutes);
// app.use("/", authRoutes);

db.initDb((err, db) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(3100);
  }
});
