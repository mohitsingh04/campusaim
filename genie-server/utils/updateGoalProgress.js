import Goal from "../models/goal.js";

export const updateGoalProgress = async (counselorId, goalType) => {
    try {
        const today = new Date().toISOString().slice(0, 10);

        const goals = await Goal.find({
            counselorId,
            goalType,
            status: { $in: ["active", "completed"] } // ✅ include completed
        });

        if (!goals.length) return;

        for (const goal of goals) {

            // ✅ ALWAYS increment (no cap)
            goal.currentValue += 1;

            // ✅ DAILY LOG (SAFE STRING COMPARE)
            const logIndex = goal.progressLogs.findIndex(
                log => log.date === today
            );

            if (logIndex > -1) {
                goal.progressLogs[logIndex].count += 1;
            } else {
                goal.progressLogs.push({ date: today, count: 1 });
            }

            // ✅ STATUS LOGIC (idempotent)
            if (goal.currentValue >= goal.targetValue) {
                goal.status = "completed";
            }

            await goal.save();
        }
    } catch (err) {
        console.error("Goal update error", err);
    }
};