import express from "express";
import formidable from "express-formidable"

import { createHotel, browseHotel, getImage, getSellerHotels, editHotel } from "../controllers/hotel.controller";
import { requireSignIn } from "../middlewares";

const router = express.Router();

router.post("/create-hotel", requireSignIn, formidable(), createHotel);
router.get("/hotels", browseHotel);
router.get("/hotel/image/:hotelId", getImage);
router.get("/seller-hotels", requireSignIn, getSellerHotels);
router.post("/edit-hotel", requireSignIn, formidable(), editHotel);

module.exports = router;