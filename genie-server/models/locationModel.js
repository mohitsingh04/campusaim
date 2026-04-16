import mongoose from 'mongoose';
import { db } from '../mongoose/index.js';

const locationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        address: {
            type: String,
            trim: true,
            required: true,
            minlength: 5,
            maxlength: 255,
        },

        pincode: {
            type: Number,
            required: true,
            match: /^[1-9][0-9]{5}$/,
        },

        city: {
            type: String,
            trim: true,
            required: true,
        },

        state: {
            type: String,
            trim: true,
            required: true,
        },

        country: {
            type: String,
            trim: true,
            required: true,
            default: 'India',
        },
    },
    { timestamps: true }
);

const Location = db.model('Location', locationSchema);
export default Location;
