import User from "../../models/userModel.js";
import { createNotification } from "../../services/notification.service.js";

// ---------------- Notify Lead has been added ---------------- //
export const notifyLeadCreated = async ({
    organizationId = null,
    authUser,
    leadIds,
    leadName
}) => {
    try {
        // Fetch all admins in the organization to notify them
        const admins = await User.find({
            organizationId,
            role: "admin"
        }).select("_id").lean();

        if (!admins.length) return;

        const count = leadIds.length;
        const actorName = authUser?.name || "A team member";

        // 1. Dynamic Title
        const title = count === 1 ? "New Lead Added" : "Bulk Leads Added";

        // 2. Professional Message
        const message = count === 1
            ? `${actorName} added a new lead: ${leadName}.`
            : `${actorName} successfully uploaded ${count} leads to the system.`;

        // 3. Dispatch notifications to all admins
        await Promise.all(
            admins.map(admin =>
                createNotification({
                    organizationId,
                    receiverId: admin._id, // Updated field name
                    senderId: authUser._id,
                    type: "lead_created",
                    title,
                    message,
                    link: "/dashboard/leads/all",
                    meta: {
                        leadIds,
                        addedBy: authUser.role
                    }
                })
            )
        );

    } catch (error) {
        console.error("Lead creation notification failed:", error);
    }
};

// ---------------- Notify Lead was assigned ---------------- //
export const notifyLeadAssignment = async ({
    organizationId = null,
    assignToUser,
    authUser,
    leadIds
}) => {
    try {
        const count = leadIds.length;
        const isMultiple = count > 1;

        // 1. Dynamic Title: "New Lead Assigned" vs "5 New Leads Assigned"
        const title = isMultiple
            ? `${count} New Leads Assigned`
            : "New Lead Assigned";

        // 2. Dynamic Message: "Admin John assigned a lead to you"
        const message = isMultiple
            ? `${authUser.name} (${authUser.role}) assigned ${count} leads to your bucket.`
            : `${authUser.name} (${authUser.role}) assigned a new lead to you.`;

        await createNotification({
            organizationId,
            receiverId: assignToUser._id,
            senderId: authUser._id,
            type: "lead_assigned",
            title,   // e.g., "12 New Leads Assigned"
            message, // e.g., "Admin Sarah assigned 12 leads to your bucket."
            link: `/dashboard/leads/all`,
            meta: {
                leadIds,
                count,
                assignedByRole: authUser.role // Useful for FE styling
            }
        });

    } catch (error) {
        console.error("Lead assignment notification failed:", error);
    }
};

// ---------------- Notity Counselor assigned to temaleader ---------------- //
export const notifyCounselorAssignment = async ({
    organizationId,
    counselor,
    teamLeader,
    authUser
}) => {
    try {
        // 🔔 Notify the Team Leader
        await createNotification({
            organizationId,
            receiverId: teamLeader._id,
            senderId: authUser._id,
            type: "team_member_added",
            title: "New Counselor Assigned",
            message: `${counselor.name} has been added to your team by ${authUser.name}.`,
            link: `/dashboard/users/counselors/assigned`,
            meta: { counselorId: counselor._id }
        });

        // 🔔 Notify the Counselor
        await createNotification({
            organizationId,
            receiverId: counselor._id,
            senderId: authUser._id,
            type: "counselor_assigned", // Using your existing enum type
            title: "Team Leader Assigned",
            message: `${authUser.name} has assigned ${teamLeader.name} as your Team Leader.`,
            link: `/dashboard/settings?tab=profile`,
            meta: { teamLeaderId: teamLeader._id }
        });

    } catch (error) {
        console.error("Counselor assignment notification failed:", error);
    }
};