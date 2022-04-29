import express from "express";
import formidable from "express-formidable"

import { createHotel, browseHotel, getImage, getSellerHotels, editHotel, deleteHotel, getHotelDetail } from "../controllers/hotel.controller";
import { requireSignIn, hotelOwner } from "../middlewares";

const router = express.Router();

router.post("/create-hotel", requireSignIn, formidable(), createHotel);
router.get("/hotels", browseHotel);
router.get("/hotel/image/:hotelId", getImage);
router.get("/seller-hotels", requireSignIn, getSellerHotels);
router.put("/edit-hotel", requireSignIn, formidable(), editHotel);
router.delete("/delete-hotel/:hotelId", requireSignIn, hotelOwner, deleteHotel);
router.get("/hotel-detail/:hotelId", getHotelDetail);

module.exports = router;