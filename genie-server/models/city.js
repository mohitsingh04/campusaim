import mongoose from "mongoose";
import { db } from '../mongoose/index.js';

const citySchema = new mongoose.Schema({
    id: {
        type: Number
    },
    name: {
        type: String,
    },
    state_id: {
        type: Number,
    },
    state_code: {
        type: String,
    },
    country_id: {
        type: Number,
    },
    state_code: {
        type: String,
    },
});

const City = db.model('City', citySchema);
export default City;