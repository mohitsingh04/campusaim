import mongoose from "mongoose";
import { db } from "../mongoose/index.js";

const IncentiveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // type: {
    //     type: String,
    //     enum: ["global", "course-wise"],
    //     required: true,
    // },
    globalAmount: {
        type: Number,
        default: null,
        min: 0,
    },
    courseIncentives: [
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

const Incentive = db.model("Incentive", IncentiveSchema);
export default Incentive;