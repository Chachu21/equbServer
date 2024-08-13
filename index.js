import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import createDatabase from "./config/dbConfig.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
//connect to the database
createDatabase();
// Middleware
app.use(cors());
// Increase the limit for request payload size
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.listen(port, () => console.log(`Server running on port ${port}`));
