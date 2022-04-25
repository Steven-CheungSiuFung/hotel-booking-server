import fs from "fs";

import Hotel from "../models/hotel";
import User from "../models/user";

export const createHotel = (req, res) => {

    try {
        let fields = req.fields;
        let files = req.files;

        let hotel = new Hotel(fields);

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