import mongoose from "mongoose";
import Comission from "../models/comission.js"; // your config model
import ComissionEarning from "../models/comissionEarning.js";

export const handleCommission = async (lead) => {
    try {
        console.log("🔥 handleCommission CALLED");

        if (!lead || !lead._id) return;

        const { _id: leadId, name, contact, admission, status, createdBy } = lead;

        if (status !== "converted") return;

        const partnerId = createdBy; // ✅ partner = lead owner
        const courseId = admission?.courseId;

        if (
            !partnerId ||
            !courseId ||
            !mongoose.Types.ObjectId.isValid(partnerId) ||
            !mongoose.Types.ObjectId.isValid(courseId)
        ) {
            console.log("❌ Invalid commission data");
            return;
        }

        // 🔒 Duplicate protection
        const exists = await ComissionEarning.exists({
            leadId,
            partnerId
        });

        if (exists) {
            console.log("⚠️ Commission already exists");
            return;
        }

        // 🔍 Fetch config
        const config = await Comission.findOne({
            partnerId: partnerId
        });

        if (!config) {
            console.log("❌ No commission config found");
            return;
        }

        let amount = null;

        // ✅ SAME LOGIC (no type)
        const match = config.courseCommissions?.find(
            (c) => String(c.courseId) === String(courseId)
        );

        if (match) amount = match.amount;

        if (amount === null && config.globalAmount != null) {
            amount = config.globalAmount;
        }

        if (amount === null) {
            console.log("❌ No commission amount resolved");
            return;
        }

        // ✅ CREATE ENTRY
        await ComissionEarning.create({
            partnerId,
            leadId,
            courseId,
            amount,
            leadSnapshot: { name, contact },
            comissionSnapshot: {
                globalAmount: config.globalAmount || null,
                courseAmount: amount,
            },
        });

        console.log("✅ Commission CREATED:");

    } catch (err) {
        console.error("❌ handleCommission error:", err);
    }
};