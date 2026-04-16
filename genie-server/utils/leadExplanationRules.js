export const LEAD_EXPLANATION_RULES = {
    intent_high: {
        type: "positive",
        text: "Lead shows strong intent based on questionnaire responses",
    },

    intent_medium: {
        type: "neutral",
        text: "Lead shows moderate intent signals",
    },

    intent_low: {
        type: "negative",
        text: "Several responses indicate hesitation or objections",
    },

    engagement_high: {
        type: "positive",
        text: "Multiple conversations indicate strong engagement",
    },

    engagement_medium: {
        type: "neutral",
        text: "Lead has interacted more than once",
    },

    engagement_low: {
        type: "neutral",
        text: "Only one interaction recorded so far",
    },

    engagement_none: {
        type: "negative",
        text: "No engagement recorded yet",
    },

    followup_scheduled: {
        type: "positive",
        text: "Follow-up call scheduled",
    },

    counselor_confident: {
        type: "positive",
        text: "Counselor rated this lead as high potential",
    },

    counselor_neutral: {
        type: "neutral",
        text: "Counselor assessment indicates moderate potential",
    },

    counselor_doubtful: {
        type: "negative",
        text: "Counselor has low confidence in conversion",
    },
};