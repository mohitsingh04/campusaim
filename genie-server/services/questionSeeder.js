import QuestionSet from "../models/QuestionSet.js";
import Question from "../models/Question.js";

export const seedQuestionsForOrganization = async ({
    nicheId,
    organizationId,
    createdBy,
}) => {
    // Prevent duplicate seeding
    const alreadySeeded = await Question.exists({ organizationId, nicheId });
    if (alreadySeeded) return;

    const templates = await QuestionSet.find({
        nicheId,
        isActive: "active",
    }).lean();

    if (!templates.length) return;

    const questions = templates.map((tpl) => ({
        nicheId: tpl.nicheId,
        organizationId,
        order: tpl.order,
        title: tpl.title,
        questionText: tpl.questionText,
        slug: tpl.slug,
        options: tpl.options,
        status: "active",
        createdBy,
    }));

    await Question.insertMany(questions);
};
