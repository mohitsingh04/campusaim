import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const comissionSchema = new mongoose.Schema({
    partnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    type: {
        type: String,
        enum: ["global", "course-wise"],
    },

    globalAmount: {
        type: Number,
        required: true,
        min: 0,
    },

    courseCommissions: [
        {
            courseId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course",
                required: true,
            },
            amount: {
                type: Number,
                required: true,
                min: 0,
            },
        }
    ],

}, { timestamps: true });

const Comission = db.model("comission", comissionSchema);
export default Comission;