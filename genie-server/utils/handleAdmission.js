import mongoose from "mongoose";
import Incentive from "../models/incentive.js";
import IncentiveEarning from "../models/incentiveEarning.js";
import RegularUser from "../models/regularUser.js";

export const handleAdmission = async (lead) => {
    try {
        console.log("🔥 handleAdmission CALLED");

        // ✅ Guard
        if (!lead || !lead._id) {
            console.log("❌ Lead missing");
            return;
        }

        const { _id: leadId, name, contact, admission, status } = lead;

        console.log("📌 Lead Status:", status);
        console.log("📌 Admission Object:", admission);

        // ✅ Status check
        if (status !== "converted") {
            console.log("❌ Skipped: status is not converted");
            return;
        }

        const userId = admission?.userId;
        const courseId = admission?.courseId;

        console.log("📌 userId:", userId);
        console.log("📌 courseId:", courseId);

        // ✅ Validation
        if (
            !userId ||
            !courseId ||
            !mongoose.Types.ObjectId.isValid(userId) ||
            !mongoose.Types.ObjectId.isValid(courseId)
        ) {
            console.log("❌ Invalid admission data", {
                userId,
                courseId,
                isUserValid: mongoose.Types.ObjectId.isValid(userId),
                isCourseValid: mongoose.Types.ObjectId.isValid(courseId)
            });
            return;
        }

        // ================================
        // ✅ FUNCTION: CREATE INCENTIVE
        // ================================
        // ================================
        // ✅ FUNCTION: CREATE INCENTIVE
        // ================================
        const createIncentive = async (targetUserId, role = "USER") => {
            try {
                console.log(`➡️ Processing incentive for ${role}:`, targetUserId);

                const exists = await IncentiveEarning.exists({
                    leadId,
                    userId: targetUserId
                });

                if (exists) {
                    console.log("⚠️ Skipped: Already exists");
                    return;
                }

                const incentive = await Incentive.findOne({
                    userId: targetUserId
                }).lean();

                if (!incentive) {
                    console.log("❌ No incentive config found");
                    return;
                }

                console.log("📊 Incentive config:", incentive);

                let amount = null;
                let type = null;

                // 🔍 find course match
                const match = incentive.courseIncentives?.find(
                    (c) => String(c.courseId) === String(courseId)
                );

                console.log("🔍 Match:", match);

                // ✅ FIX: ignore 0/null/undefined
                if (
                    match &&
                    typeof match.amount === "number" &&
                    match.amount > 0
                ) {
                    amount = match.amount;
                    type = "course-wise";
                    console.log("✅ Using COURSE incentive:", amount);
                } else if (
                    typeof incentive.globalAmount === "number" &&
                    incentive.globalAmount > 0
                ) {
                    amount = incentive.globalAmount;
                    type = "global";
                    console.log("✅ Using GLOBAL incentive:", amount);
                }

                if (amount === null) {
                    console.log("❌ No amount resolved");
                    return;
                }

                const created = await IncentiveEarning.create({
                    userId: targetUserId,
                    leadId,
                    courseId,
                    amount,
                    type,
                    leadSnapshot: { name, contact },
                    incentiveSnapshot: {
                        type,
                        globalAmount: incentive.globalAmount ?? null,
                        courseAmount:
                            match && match.amount > 0 ? match.amount : null,
                    },
                });

                console.log("🎉 Incentive CREATED:", created._id);

            } catch (err) {
                console.error("❌ createIncentive error:", err);
            }
        };

        // ================================
        // ✅ COUNSELOR
        // ================================
        await createIncentive(userId, "COUNSELOR");

        // ================================
        // ✅ TEAM LEADER
        // ================================
        const counselor = await RegularUser.findById(userId).lean();

        console.log("👤 Counselor Data:", counselor);

        if (
            counselor?.teamLeaderId &&
            mongoose.Types.ObjectId.isValid(counselor.teamLeaderId)
        ) {
            console.log("➡️ Found Team Leader:", counselor.teamLeaderId);

            await createIncentive(counselor.teamLeaderId, "TEAM LEADER");
        } else {
            console.log("⚠️ No Team Leader found");
        }

    } catch (err) {
        console.error("❌ handleAdmission error:", err);
    }
};