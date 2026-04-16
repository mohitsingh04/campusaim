/**
 * Intent Score (Sentiment based on -1,0,1)
 * Output: 0–100
 */
export function calculateIntentScore(questions = []) {
    const totalQuestions = questions.length;
    if (!totalQuestions) return 0;

    const totalPoints = questions.reduce(
        (sum, q) => sum + (Number(q.point) || 0),
        0
    );

    const minPossible = -1 * totalQuestions;
    const maxPossible = 1 * totalQuestions;

    const normalized =
        ((totalPoints - minPossible) / (maxPossible - minPossible)) * 100;

    return Math.max(0, Math.min(100, Number(normalized.toFixed(2))));
}

/**
 * Engagement Score (Behavioral model)
 * Output: 0–100
 */
export function calculateEngagementScore({
    sessions = [],
    next_follow_up_date = null,
}) {
    let followUpScore = next_follow_up_date ? 100 : 0;

    let recencyScore = 0;
    if (sessions.length) {
        const lastSession = sessions[sessions.length - 1];
        const diffDays =
            (Date.now() - new Date(lastSession.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);

        if (diffDays <= 2) recencyScore = 100;
        else if (diffDays <= 7) recencyScore = 70;
        else if (diffDays <= 15) recencyScore = 40;
        else recencyScore = 10;
    }

    let sessionDepthScore = 0;
    if (sessions.length >= 3) sessionDepthScore = 100;
    else if (sessions.length === 2) sessionDepthScore = 70;
    else if (sessions.length === 1) sessionDepthScore = 40;

    const engagement =
        0.4 * followUpScore +
        0.3 * recencyScore +
        0.3 * sessionDepthScore;

    return Number(engagement.toFixed(2));
}

/**
 * Counselor Confidence Score
 * Output: 0–100
 */
export function calculateCounselorConfidence(rating = 0) {
    const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));
    return Number(((safeRating / 5) * 100).toFixed(2));
}

/**
 * Final Admission Probability
 * Weighted AI Hybrid Model
 */
export function calculateFinalLeadScore({
    questions = [],
    rating = 0,
    sessions = [],
    next_follow_up_date = null,
}) {
    const intentScore = calculateIntentScore(questions);
    const engagementScore = calculateEngagementScore({
        sessions,
        next_follow_up_date,
    });
    const counselorConfidence = calculateCounselorConfidence(rating);

    const finalScore =
        0.55 * intentScore +
        0.25 * engagementScore +
        0.2 * counselorConfidence;

    return {
        intentScore,
        engagementScore,
        counselorConfidence,
        finalScore: Number(finalScore.toFixed(2)),
    };
}