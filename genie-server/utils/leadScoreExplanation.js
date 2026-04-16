import { extractLeadSignals } from "./extractLeadSignals.js";
import { LEAD_EXPLANATION_RULES } from "./leadExplanationRules.js";

export const buildLeadScoreExplanation = (params) => {

    const signals = extractLeadSignals(params);

    const explanations = signals
        .map(signal => LEAD_EXPLANATION_RULES[signal])
        .filter(Boolean);

    /* ---------- Final Score Interpretation ---------- */

    const { finalScore = 0 } = params;

    if (finalScore >= 80) {
        explanations.push({
            type: "positive",
            text: "Overall score indicates very high admission probability",
        });
    } else if (finalScore >= 60) {
        explanations.push({
            type: "positive",
            text: "Lead has strong admission potential",
        });
    } else if (finalScore >= 40) {
        explanations.push({
            type: "neutral",
            text: "Lead shows moderate potential, further nurturing recommended",
        });
    } else {
        explanations.push({
            type: "negative",
            text: "Lead currently shows low conversion likelihood",
        });
    }

    return explanations;
};