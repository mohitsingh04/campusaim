import mongoose from "mongoose";
import { db } from '../mongoose/index.js';

const countrySchema = new mongoose.Schema({
    country_id: {
        type: String,
    },
    sortname: {
        type: String,
    },
    country_name: {
        type: String,
    },
});

const Countries = db.model('Country', countrySchema);
export default Countries;