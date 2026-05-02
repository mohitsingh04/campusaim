import RegularUser from "../../models/regularUser.js";
import { createNotification } from "../../services/notification.service.js";
import { getRoleIds } from "../../utils/profileRole.util.js";
import { mapRoleForApp } from "../../utils/roleMapper.js";

/* ================= LEAD CREATED ================= */
export const notifyLeadCreated = async ({ authUser, leadIds, leadName }) => {
    try {
        // 🔥 get admin role id
        const adminRoleId = await getRoleIds("admin");

        const admins = await RegularUser.find({
            role: adminRoleId
        }).select("_id").lean();

        if (!admins.length) return;

        const count = leadIds.length;
        const actorName = authUser?.name || "A team member";
        const actorRole = mapRoleForApp(authUser.role?.role);

        const title = count === 1 ? "New Lead Added" : "Bulk Leads Added";

        const message = count === 1
            ? `${actorName} (${actorRole}) added a new lead: ${leadName}.`
            : `${actorName} (${actorRole}) uploaded ${count} leads to the system.`;

        await Promise.all(
            admins.map(admin =>
                createNotification({
                    receiverId: admin._id,
                    senderId: authUser._id,
                    type: "lead_created",
                    title,
                    message,
                    link: "/dashboard/leads/all",
                    meta: {
                        leadIds,
                        addedBy: actorRole
                    }
                })
            )
        );

    } catch (error) {
        console.error("Lead creation notification failed:", error);
    }
};

/* ================= LEAD ASSIGNMENT ================= */
export const notifyLeadAssignment = async ({ assignToUser, authUser, leadIds }) => {
    try {
        const count = leadIds.length;
        const isMultiple = count > 1;

        const actorRole = mapRoleForApp(authUser.role?.role);

        const title = isMultiple
            ? `${count} New Leads Assigned`
            : "New Lead Assigned";

        const message = isMultiple
            ? `${authUser.name} (${actorRole}) assigned ${count} leads to you.`
            : `${authUser.name} (${actorRole}) assigned a new lead to you.`;

        await createNotification({
            receiverId: assignToUser._id,
            senderId: authUser._id,
            type: "lead_assigned",
            title,
            message,
            link: `/dashboard/leads/all`,
            meta: {
                leadIds,
                count,
                assignedByRole: actorRole
            }
        });

    } catch (error) {
        console.error("Lead assignment notification failed:", error);
    }
};

/* ================= COUNSELOR ASSIGNMENT ================= */
export const notifyCounselorAssignment = async ({ counselor, teamLeader, authUser }) => {
    try {
        const actorRole = mapRoleForApp(authUser.role?.role);

        // 🔔 Notify Team Leader
        await createNotification({
            receiverId: teamLeader._id,
            senderId: authUser._id,
            type: "team_member_added",
            title: "New Counselor Assigned",
            message: `${counselor.name} has been added to your team by ${authUser.name} (${actorRole}).`,
            link: `/dashboard/users/counselors/assigned`,
            meta: { counselorId: counselor._id }
        });

        // 🔔 Notify Counselor
        await createNotification({
            receiverId: counselor._id,
            senderId: authUser._id,
            type: "counselor_assigned",
            title: "Team Leader Assigned",
            message: `${authUser.name} (${actorRole}) assigned ${teamLeader.name} as your Team Leader.`,
            link: `/dashboard/settings?tab=profile`,
            meta: { teamLeaderId: teamLeader._id }
        });

    } catch (error) {
        console.error("Counselor assignment notification failed:", error);
    }
};