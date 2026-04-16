import Lead from "../models/leadsModel.js";
import LeadConversation from "../models/leadConversation.js";

export const buildLeadTimeline = async (leadId) => {

    const lead = await Lead.findById(leadId)
        .populate("createdBy", "name role")
        .populate("convertedBy", "name role")
        .populate("assignmentHistory.assignedTo", "name role")
        .lean();

    if (!lead) {
        throw new Error("Lead not found");
    }

    const conversation = await LeadConversation
        .findOne({ lead_id: leadId })
        .populate("sessions.createdBy", "name role")
        .lean();

    const events = [];

    events.push({
        type: "created",
        label: "Lead Created",
        date: lead.createdAt
    });

    if (lead.assignmentHistory?.length) {
        lead.assignmentHistory.forEach(a => {
            events.push({
                type: "assigned",
                label: `Assigned to ${a.assignedTo?.name || "User"}`,
                date: a.assignedOn
            });
        });
    }

    if (conversation?.sessions?.length) {
        conversation.sessions.forEach(s => {
            events.push({
                type: "conversation",
                label: `Conversation by ${s.createdBy?.name || "User"}`,
                date: s.createdAt
            });
        });
    }

    if (lead.status === "converted") {
        events.push({
            type: "converted",
            label: `Lead Converted by ${lead.convertedBy?.name || "User"}`,
            date: lead.convertedAt
        });
    }

    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    return events;
};