import mongoose from "mongoose"
import { regularDatabase } from "../database/Databases.js"

const PropertyMapSchema = new mongoose.Schema({
    property_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
        required: true,
    },
    mapUrl: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const PropertyMap = regularDatabase.model("PropertyMap", PropertyMapSchema)

export default PropertyMap