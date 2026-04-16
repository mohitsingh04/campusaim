import mongoose from "mongoose";
import Incentive from "../models/incentive.js";
import IncentiveEarning from "../models/incentiveEarning.js";
import User from "../models/userModel.js";

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
        const createIncentive = async (targetUserId, role = "USER") => {
            try {
                console.log(`➡️ Processing incentive for ${role}:`, targetUserId);

                // 🔒 Duplicate check
                const exists = await IncentiveEarning.exists({
                    leadId,
                    userId: targetUserId
                });

                console.log("🔍 Existing incentive?", !!exists);

                if (exists) {
                    console.log("⚠️ Skipped: Already exists");
                    return;
                }

                // 🔍 Fetch incentive config
                const incentive = await Incentive.findOne({
                    userId: targetUserId
                }).lean();

                console.log("📊 Incentive config:", incentive);

                if (!incentive) {
                    console.log("❌ No incentive config found");
                    return;
                }

                let amount = null;

                // 1️⃣ Try course-wise first
                const match = incentive.courseIncentives?.find(
                    (c) => String(c.courseId) === String(courseId)
                );

                if (match) {
                    amount = match.amount;
                }

                // 2️⃣ Fallback to global
                if (amount === null && incentive.globalAmount != null) {
                    amount = incentive.globalAmount;
                }

                console.log("💰 Calculated amount:", amount);

                if (amount === null) {
                    console.log("❌ No amount resolved", {
                        courseId: String(courseId),
                        available: incentive.courseIncentives?.map(c => ({
                            id: String(c.courseId),
                            amount: c.amount
                        })),
                        globalAmount: incentive.globalAmount
                    });
                    return;
                }

                const created = await IncentiveEarning.create({
                    userId: targetUserId,
                    leadId,
                    courseId,
                    amount,
                    type: incentive.type,
                    leadSnapshot: { name, contact },
                    incentiveSnapshot: {
                        type: incentive.type,
                        globalAmount: incentive.globalAmount || null,
                        courseAmount: amount,
                    },
                });

                console.log("✅ Incentive CREATED:", created._id);

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
        const counselor = await User.findById(userId).lean();

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

// import mongoose from "mongoose";
// import Incentive from "../models/incentive.js";
// import IncentiveEarning from "../models/incentiveEarning.js";

// export const handleAdmission = async (lead) => {
//     try {
//         const { _id: leadId, name, contact, admission } = lead;

//         const counselorId = admission?.counselorId;
//         const courseId = admission?.courseId;

//         console.log("🔥 handleAdmission CALLED", {
//             leadId,
//             courseId,
//             counselorId
//         });

//         if (
//             !counselorId ||
//             !courseId ||
//             !mongoose.Types.ObjectId.isValid(counselorId) ||
//             !mongoose.Types.ObjectId.isValid(courseId)
//         ) {
//             console.log("❌ Invalid data for incentive", { counselorId, courseId });
//             return;
//         }

//         const exists = await IncentiveEarning.exists({ leadId });
//         if (exists) return;

//         const incentive = await Incentive.findOne({ counselorId }).lean();
//         if (!incentive) return;

//         let amount = null;

//         if (incentive.type === "global") {
//             amount = incentive.globalAmount;
//         }

//         if (incentive.type === "course-wise") {
//             const match = incentive.courseIncentives?.find(
//                 (c) => String(c.courseId) === String(courseId)
//             );
//             if (match) amount = match.amount;
//         }

//         if (amount === null) {
//             console.log("❌ No incentive match found");
//             return;
//         }

//         const result = await IncentiveEarning.findOneAndUpdate(
//             { leadId },
//             {
//                 $setOnInsert: {
//                     counselorId,
//                     leadId,
//                     courseId,
//                     amount,
//                     type: incentive.type,
//                     leadSnapshot: { name, contact },
//                     incentiveSnapshot: {
//                         type: incentive.type,
//                         globalAmount: incentive.globalAmount || null,
//                         courseAmount: amount,
//                     },
//                 },
//             },
//             { upsert: true, new: true }
//         );

//         console.log("✅ Incentive added:", result._id);

//     } catch (err) {
//         console.error("Incentive calc error:", err);
//     }
// };