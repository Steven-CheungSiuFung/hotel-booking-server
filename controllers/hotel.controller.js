import fs from "fs";

import Hotel from "../models/hotel";
import Order from "../models/order";

export const createHotel = (req, res) => {

    try {
        let fields = req.fields;
        let files = req.files;

        let hotel = new Hotel(fields);

        hotel.postedBy = req.user._id;

        if(files.image) {
            hotel.image.data = fs.readFileSync(files.image.path);
            hotel.image.contentType = files.image.type;
        };

        hotel.save((error, result) => {
            if (error) {
                console.log("saving hotel error ===> ", error);
                res.status(400).send("Error saving");
            };
            res.json(result);
        });

    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message,
        })
    }
}

export const browseHotel = async (req, res) => {
    let hotelInfo = await Hotel.find({})
        .limit(12)
        .select("-image.data")
        .populate("postedBy", "_id name")
        .exec();
    res.json(hotelInfo);
}

export const getImage = async (req, res) => {
    let hotel = await Hotel.findById(req.params.hotelId).exec();
    if (hotel && hotel.image && hotel.image.data != null) {
        res.set("Content-Type", hotel.image.contentType);
        return res.send(hotel.image.data);
    }
}

export const getSellerHotels = async (req, res) => {
    let hotels = await Hotel.find({postedBy: req.user._id})
        .select("-image.data")
        .populate("postedBy", "_id name")
        .exec();
    res.json(hotels);
}

export const editHotel = async (req, res) => {
    try {
        let fields = req.fields;
        let files = req.files;
        let data = {...fields};
        let image = {};

        if(files.image) {
            image.data = fs.readFileSync(files.image.path);
            image.contentType = files.image.type;
            data.image = image;
        };

        let updatedHotel = await Hotel.findOneAndUpdate({_id: fields._id}, data, {new: true})
            .select("-image.data");
        res.json(updatedHotel);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message,
        })
    }
}

export const deleteHotel = async (req, res) => {
    try {
        const removed = await Hotel.findByIdAndDelete(req.params.hotelId)
            .select("-image.data")
            .exec();
        res.json(removed);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message,
        })
    }
}

export const getHotelDetail = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId)
            .select("-image.data")
            .populate("postedBy", "_id name")
            .exec();
        res.json(hotel);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message,
        })
    }
}

export const getUserHotelBooking = async (req, res) => {
    try {
        const orderData = await Order
            .find({orderedBy: req.user._id})
            .select("session")
            .populate("hotel", "-image.data")
            .populate("orderedBy", "_id name")
            .exec();
        res.json(orderData);
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: error.message,
        })
    }
}