import express from "express";
import cors from "cors";
const morgan = require("morgan");

import mongoose from "mongoose";

import { readdirSync } from "fs";

require("dotenv").config();

const app = express();

mongoose
    .connect(process.env.DATABASE, {})
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log("DB Connection Error: ", err))

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// route
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port 8000`));