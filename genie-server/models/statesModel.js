import mongoose from "mongoose";
import { db } from '../mongoose/index.js';

const statesSchema = new mongoose.Schema({
    id: {
        type: Number
    },
    name: {
        type: String,
    },
    country_id: {
        type: Number,
    },
    state_code: {
        type: String,
    },
    state_name: {
        type: String,
    },
});

const States = db.model('States', statesSchema);
export default States;