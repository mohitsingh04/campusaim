import Question from "../ask_model/Question.js";
import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
    try {
        // 1. Fetch all categories
        const categories = await Category.find().lean();
        const categoryIds = categories.map(cat => cat._id);

        // 2. Fetch all questions for these categories in one query
        const questions = await Question.find({ category: { $in: categoryIds } })
            .select("title slug category")
            .lean();

        // 3. Group questions by categoryId
        const questionsByCategory = {};
        for (const q of questions) {
            // Support multi-category (array) or single category
            const catIds = Array.isArray(q.category) ? q.category : [q.category];
            for (const catId of catIds) {
                const key = catId?.toString();
                if (!key) continue;
                if (!questionsByCategory[key]) questionsByCategory[key] = [];
                questionsByCategory[key].push({
                    _id: q._id,
                    title: q.title,
                    slug: q.slug,
                });
            }
        }

        // 4. Attach questions to each category
        const enrichedCategories = categories.map(cat => ({
            ...cat,
            questions: questionsByCategory[cat._id.toString()] || [],
        }));
        return res.status(200).json(enrichedCategories);
    } catch (error) {
        console.log("Error on Get Categories", error);
        res.status(500).json({ error: "Error on Get Categories" });
    }
};

export const getCategoriesById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findOne({ _id: id });

        if (!category) {
            return res.status(404).json({ error: "Category not found" });
        }

        return res.status(200).json(category);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const topCategories = async (req, res) => {
    try {
        // --- FIX 1: Fetch only the categories that are 'Ask' topics ---
        const askTopics = await Category.find({ parent_category: "Ask" }).lean();
        const askTopicIds = askTopics.map(topic => topic._id);

        // --- FIX 2: Count questions that belong ONLY to these 'Ask' topics ---
        const allQuestions = await Question.find({ category: { $in: askTopicIds } })
            .lean();

        // Count occurrences of each 'Ask' category ID
        const categoryCounts = new Map();
        for (const question of allQuestions) {
            const catIds = Array.isArray(question.category) ? question.category : [question.category];
            for (const catId of catIds) {
                if (catId) {
                    const idString = catId.toString();
                    // Only increment count if it's one of our 'Ask' topics
                    if (askTopicIds.some(id => id.toString() === idString)) {
                        categoryCounts.set(idString, (categoryCounts.get(idString) || 0) + 1);
                    }
                }
            }
        }

        // --- FIX 3: Combine data and sort ---
        const enrichedAndOrdered = askTopics
            .map(cat => ({
                ...cat,
                // The frontend needs this property name
                questionCount: categoryCounts.get(cat._id.toString()) || 0,
            }))
            .sort((a, b) => b.questionCount - a.questionCount); // Sort by the final count

        // Slice to get the top 6 AFTER sorting
        const top6 = enrichedAndOrdered.slice(0, 6);
        // Backend now provides exactly what the frontend needs
        return res.status(200).json(top6);

    } catch (error) {
        console.log("Error on Get Categories", error);
        res.status(500).json({ error: "Error on Get Categories" });
    }
};