import express from "express";
import formidable from "express-formidable"

import { createHotel, browseHotel } from "../controllers/hotel.controller";
import { requireSignIn } from "../middlewares";

const router = express.Router();

router.post("/create-hotel", requireSignIn, formidable(), createHotel);
router.get("/hotels", browseHotel);

module.exports = router;