import mongoose from "mongoose";
import Comission from "../models/comission.js";
import ComissionEarning from "../models/comissionEarning.js";

export const handleCommission = async (lead) => {
    try {
        console.log("🔥 handleCommission CALLED");

        if (!lead || !lead._id) {
            console.log("❌ Invalid lead");
            return;
        }

        const { _id: leadId, name, contact, admission, status, createdBy } = lead;

        if (status !== "converted") {
            console.log("⏭ Skipped: not converted");
            return;
        }

        const partnerId = createdBy;
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
        const exists = await ComissionEarning.exists({ leadId, partnerId });

        if (exists) {
            console.log("⚠️ Commission already exists");
            return;
        }

        // 🔍 Fetch config
        const config = await Comission.findOne({ partnerId }).lean();

        if (!config) {
            console.log("❌ No commission config found");
            return;
        }

        console.log("⚙️ Config:", config);

        let amount = null;
        let type = null;

        const match = config.courseCommissions?.find(
            (c) => String(c.courseId) === String(courseId)
        );

        console.log("🔍 Match:", match);

        // ✅ FIX: ignore 0 / null / undefined
        if (
            match &&
            typeof match.amount === "number" &&
            match.amount > 0
        ) {
            amount = match.amount;
            type = "course-wise";
            console.log("✅ Using COURSE amount:", amount);
        } else if (
            typeof config.globalAmount === "number" &&
            config.globalAmount > 0
        ) {
            amount = config.globalAmount;
            type = "global";
            console.log("✅ Using GLOBAL amount:", amount);
        }

        if (amount === null) {
            console.log("❌ No commission amount resolved");
            return;
        }

        // ✅ CREATE ENTRY
        const created = await ComissionEarning.create({
            partnerId,
            leadId,
            courseId,
            amount,
            type,
            leadSnapshot: { name, contact },
            comissionSnapshot: {
                globalAmount: config.globalAmount ?? null,
                courseAmount:
                    match && match.amount > 0 ? match.amount : null,
            },
        });

        console.log("🎉 Commission CREATED:", created._id);

    } catch (err) {
        console.error("❌ handleCommission error:", err);
    }
};