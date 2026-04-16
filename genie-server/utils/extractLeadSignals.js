export const extractLeadSignals = ({
    questions = [],
    rating = 0,
    sessions = [],
    next_follow_up_date = null,
}) => {

    const signals = [];

    const total = questions.length || 1;

    const positive = questions.filter(q => Number(q.point) > 0).length;
    const negative = questions.filter(q => Number(q.point) < 0).length;

    const positiveRatio = positive / total;
    const negativeRatio = negative / total;

    /* ---------- Intent ---------- */

    if (positiveRatio >= 0.7) signals.push("intent_high");
    else if (positiveRatio >= 0.4) signals.push("intent_medium");

    if (negativeRatio >= 0.3) signals.push("intent_low");

    /* ---------- Engagement ---------- */

    if (sessions.length >= 3) signals.push("engagement_high");
    else if (sessions.length === 2) signals.push("engagement_medium");
    else if (sessions.length === 1) signals.push("engagement_low");
    else signals.push("engagement_none");

    if (next_follow_up_date) signals.push("followup_scheduled");

    /* ---------- Counselor Rating ---------- */

    if (rating >= 4) signals.push("counselor_confident");
    else if (rating === 3) signals.push("counselor_neutral");
    else if (rating > 0) signals.push("counselor_doubtful");

    return signals;
};