import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import createDatabase from "./config/dbConfig.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
createDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
