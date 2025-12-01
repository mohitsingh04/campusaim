import Answer from "../ask_model/Answer.js";
import Comment from "../ask_model/Comment.js";
import Question from "../ask_model/Question.js";
import Category from "../models/Category.js";
import RegularUser from "../profile-model/RegularUser.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import { Filter } from "bad-words";
import { updateReputation } from "./ReputationController.js";
import Follow from "../ask_model/Follow.js";
import Vote from "../ask_model/Vote.js";
import Notification from "../ask_model/Notification.js";

const filter = new Filter();

function normalizeTitle(title) {
    let t = title.replace(/\s+([?.!,;:])/g, "$1");
    t = t.replace(/\s+/g, " ").trim();
    return t;
}

const generateSlug = async (title) => {
    let baseSlug = title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric except spaces and dashes
        .replace(/\s+/g, "-")         // replace spaces with dashes
        .replace(/-+/g, "-")          // collapse multiple dashes
        .replace(/^-+|-+$/g, "");     // remove leading/trailing dashes

    let slug = baseSlug;
    let counter = 1;

    while (await Question.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
};

export const getAllQuestions = async (req, res) => {
    try {
        // Get current user ID (if logged in)
        let userId = null;
        try {
            userId = await getDataFromToken(req);
        } catch (e) {
            userId = null;
        }

        // 1. Fetch all questions (add pagination if needed)
        const questions = await Question.find().sort({ createdAt: -1 }).lean();

        // 2. Collect unique author and category IDs
        const authorIds = [...new Set(questions.map(q => q.author).filter(Boolean).map(String))];
        // For multi-category support, flatten all category arrays
        const categoryIds = [
            ...new Set(
                questions
                    .flatMap(q => Array.isArray(q.category) ? q.category : [q.category])
                    .filter(Boolean)
                    .map(String)
            )
        ];
        const questionIds = questions.map(q => q._id);

        // 3. Batch fetch related data
        const [authors, categories, votes, answers] = await Promise.all([
            RegularUser.find({ _id: { $in: authorIds } }).select("name").lean(),
            Category.find({ _id: { $in: categoryIds } }).select("category_name slug").lean(),
            Vote.find({ question: { $in: questionIds } }).lean(),
            Answer.aggregate([
                { $match: { question: { $in: questionIds } } },
                { $group: { _id: "$question", count: { $sum: 1 } } }
            ])
        ]);

        // 4. Map by ID for quick lookup
        const authorMap = Object.fromEntries(authors.map(a => [a._id.toString(), a]));
        const categoryMap = Object.fromEntries(categories.map(c => [c._id.toString(), c]));
        const voteMap = Object.fromEntries(votes.map(v => [v.question.toString(), v]));
        const answerCountMap = Object.fromEntries(answers.map(a => [a._id.toString(), a.count]));

        // 5. Attach to questions
        const enrichedQuestions = questions.map(q => {
            // Author
            const author = q.author ? authorMap[q.author.toString()] || null : null;

            // Categories (always array)
            let categoryArr = [];
            if (Array.isArray(q.category) && q.category.length > 0) {
                categoryArr = q.category.map(catId => categoryMap[catId.toString()]).filter(Boolean);
            } else if (q.category) {
                const singleCat = categoryMap[q.category.toString()];
                if (singleCat) categoryArr = [singleCat];
            }

            // Votes
            const voteDoc = voteMap[q._id.toString()] || {};
            const upvotes = voteDoc.upvotes ? voteDoc.upvotes.length : 0;
            const downvotes = voteDoc.downvotes ? voteDoc.downvotes.length : 0;
            const hasUpvoted = userId ? (voteDoc.upvotes || []).map(String).includes(String(userId)) : false;
            const hasDownvoted = userId ? (voteDoc.downvotes || []).map(String).includes(String(userId)) : false;

            // Answers count
            const answersCount = answerCountMap[q._id.toString()] || 0;

            return {
                ...q,
                author,
                category: categoryArr,
                upvotes,
                downvotes,
                hasUpvoted,
                hasDownvoted,
                answersCount,
            };
        });

        res.status(200).json({
            status: true,
            data: enrichedQuestions,
        });

    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getQuestionById = async (req, res) => {
    try {
        // First, find the question
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        // Manual populate: Author (from profileDatabase)
        const author = question.author
            ? await RegularUser.findById(question.author).select("name email")
            : null;

        // Manual populate: Category (depends which DB you put Category in)
        const category = question.category
            ? await Category.findById(question.category).select("category_name")
            : null;

        // Merge everything into one response object
        const enrichedQuestion = {
            ...question.toObject(),
            author,
            category,
        };

        res.json(enrichedQuestion);

    } catch (error) {
        console.error("Error fetching question by ID:", error);
        res.status(500).json({ error: error.message });
    }
};

export const getQuestionDetail = async (req, res) => {
    try {
        const { slug } = req.params;

        // 1. Find the question by slug (lean for performance)
        const question = await Question.findOne({ slug }).lean();
        if (!question) {
            return res.status(404).json({ error: 'Question not found' });
        }
        const qid = question._id;

        // 2. Get current user ID (if logged in)
        let userId = null;
        try {
            userId = await getDataFromToken(req);
        } catch (e) {
            userId = null;
        }

        // 3. Batch fetch author and categories
        const authorId = question.author;
        const categoryIds = Array.isArray(question.category)
            ? question.category.filter(Boolean)
            : question.category ? [question.category] : [];

        const [author, categories] = await Promise.all([
            authorId ? RegularUser.findById(authorId).select('name username').lean() : null,
            categoryIds.length
                ? Category.find({ _id: { $in: categoryIds } }).select('category_name slug').lean()
                : [],
        ]);

        // 4. Batch fetch votes for question
        const questionVote = await Vote.findOne({ question: qid }).lean();
        const questionUpvotes = questionVote?.upvotes?.length || 0;
        const questionDownvotes = questionVote?.downvotes?.length || 0;
        const hasUpvoted = userId ? (questionVote?.upvotes || []).map(String).includes(String(userId)) : false;
        const hasDownvoted = userId ? (questionVote?.downvotes || []).map(String).includes(String(userId)) : false;

        // 5. Fetch all answers for the question
        const answers = await Answer.find({ question: qid }).sort({ createdAt: -1 }).lean();
        const answerIds = answers.map(a => a._id);
        const answerAuthorIds = answers.map(a => a.author).filter(Boolean).map(String);

        // 6. Fetch all votes for answers in one go
        const answerVotes = await Vote.find({ answer: { $in: answerIds } }).lean();
        const answerVoteMap = Object.fromEntries(answerVotes.map(v => [v.answer.toString(), v]));

        // 7. Fetch all comments for answers in one go
        const answerComments = await Comment.find({ answer: { $in: answerIds } }).sort({ createdAt: -1 }).lean();
        const answerCommentAuthorIds = answerComments.map(c => c.author).filter(Boolean).map(String);

        // 8. Fetch all authors for answers and comments in one go
        const allUserIds = [
            ...(answerAuthorIds || []),
            ...(answerCommentAuthorIds || []),
        ];
        const uniqueUserIds = [...new Set(allUserIds)];
        const users = uniqueUserIds.length
            ? await RegularUser.find({ _id: { $in: uniqueUserIds } }).select('name username').lean()
            : [];
        const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

        // 9. Map comments to answers
        const commentsByAnswerId = {};
        for (const c of answerComments) {
            const aid = c.answer.toString();
            if (!commentsByAnswerId[aid]) commentsByAnswerId[aid] = [];
            commentsByAnswerId[aid].push({
                ...c,
                author: c.author ? userMap[c.author.toString()] || null : null,
            });
        }

        // 10. Enrich answers
        const answersWithVotesAndComments = answers.map(answer => {
            const vote = answerVoteMap[answer._id.toString()] || {};
            return {
                ...answer,
                author: answer.author ? userMap[answer.author.toString()] || null : null,
                comments: commentsByAnswerId[answer._id.toString()] || [],
                upvotes: vote.upvotes ? vote.upvotes.length : 0,
                downvotes: vote.downvotes ? vote.downvotes.length : 0,
                hasUpvoted: userId ? (vote.upvotes || []).map(String).includes(String(userId)) : false,
                hasDownvoted: userId ? (vote.downvotes || []).map(String).includes(String(userId)) : false,
            };
        });

        // 11. Fetch and enrich question comments
        const questionComments = await Comment.find({ question: qid }).sort({ createdAt: -1 }).lean();
        const questionCommentAuthorIds = questionComments.map(c => c.author).filter(Boolean).map(String);
        const questionCommentUsers = questionCommentAuthorIds.length
            ? await RegularUser.find({ _id: { $in: questionCommentAuthorIds } }).select('name username').lean()
            : [];
        const questionCommentUserMap = Object.fromEntries(questionCommentUsers.map(u => [u._id.toString(), u]));
        const questionCommentsWithAuthor = questionComments.map(c => ({
            ...c,
            author: c.author ? questionCommentUserMap[c.author.toString()] || null : null,
        }));

        // 12. Return response
        res.json({
            ...question,
            author,
            category: categories,
            upvotes: questionUpvotes,
            downvotes: questionDownvotes,
            hasUpvoted,
            hasDownvoted,
            answers: answersWithVotesAndComments,
            comments: questionCommentsWithAuthor,
        });
    } catch (error) {
        console.error('Error fetching question detail:', error);
        res.status(500).json({ error: error.message });
    }
};

export const createQuestion = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const user = await RegularUser.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        let { title, category, description, createdAt, updatedAt } = req.body;
        title = normalizeTitle(title);

        // Validate category is an array and not empty
        if (!title || !Array.isArray(category) || category.length === 0) {
            return res
                .status(400)
                .json({ error: "Title and at least one category are required." });
        }

        if (filter.isProfane(title) || (description && filter.isProfane(description))) {
            return res.status(400).json({
                error: "Please avoid using abusive or inappropriate words.",
            });
        }
        const slug = await generateSlug(title);

        const newQuestion = new Question({
            title,
            slug,
            category, // now an array
            description,
            author: user._id,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
        });

        const savedQuestion = await newQuestion.save();

        // ✅ Update user reputation (+10 points for asking a question)
        await updateReputation(user._id, "ASK_QUESTION");

        // --- Notify followers of the user (author) ---
        try {
            const userFollowers = await Follow.find({
                followingType: "User",
                following: user._id
            }).select("follower");

            const followerIds = userFollowers.map(f => f.follower);

            if (followerIds.length > 0) {
                const notificationPayload = followerIds.map(followerId => ({
                    recipient: followerId,
                    sender: user._id,
                    type: "USER_ASKED_QUESTION",
                    question: savedQuestion._id,
                }));

                await Notification.insertMany(notificationPayload);
            }
        } catch (notificationError) {
            console.error("Failed to create notifications for followers:", notificationError);
        }

        // --- Notify followers of the selected categories/topics ---
        try {
            // Find all users who follow any of the selected categories/topics
            const categoryFollowers = await Follow.find({
                followingType: "Category",
                following: { $in: category }
            }).select("follower");

            // Remove duplicates and the question author
            const categoryFollowerIds = [
                ...new Set(
                    categoryFollowers
                        .map(f => f.follower.toString())
                        .filter(followerId => followerId !== user._id.toString())
                )
            ];

            if (categoryFollowerIds.length > 0) {
                const notificationPayload = categoryFollowerIds.map(followerId => ({
                    recipient: followerId,
                    sender: user._id,
                    type: "TOPIC_NEW_QUESTION",
                    question: savedQuestion._id,
                    category: Array.isArray(savedQuestion.category) ? savedQuestion.category[0] : savedQuestion.category, // just the first for now
                }));

                await Notification.insertMany(notificationPayload);
            }
        } catch (notificationError) {
            console.error("Failed to create notifications for category followers:", notificationError);
        }

        return res.status(201).json({
            message: "Question added successfully.",
            question: savedQuestion,
        });
    } catch (error) {
        console.error("Error creating question:", error.message);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const updateQuestion = async (req, res) => {
    try {
        const userId = await getDataFromToken(req);

        const user = await RegularUser.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const { title, description, createdAt, updatedAt, category } = req.body;
        const { questionId } = req.params;

        // 🔍 Find question and verify author
        const question = await Question.findOne({
            _id: questionId,
            author: user._id
        });

        if (!question) {
            return res.status(404).json({
                error: "Question not found or you are not authorized to edit this question.",
            });
        }

        // 🛑 Profanity check
        if (filter.isProfane(title) || (description && filter.isProfane(description))) {
            return res.status(400).json({
                error: "Please avoid using abusive or inappropriate words.",
            });
        }

        // ⭐ UPDATE TITLE + SLUG
        if (title && title !== question.title) {
            question.title = title;

            // Generate new unique slug
            const newSlug = await generateSlug(title);
            question.slug = newSlug;
        }

        // ⭐ UPDATE DESCRIPTION
        if (description) question.description = description;

        // ⭐ UPDATE CATEGORIES
        if (category && Array.isArray(category) && category.length > 0) {
            question.category = category.map(id => id.toString());
        }

        // ⭐ CREATED AT & UPDATED AT
        if (createdAt) question.createdAt = new Date(createdAt);
        question.updatedAt = new Date(); // auto update updatedAt always

        const updatedQuestion = await question.save();

        return res.status(200).json({
            message: "Question updated successfully.",
            question: updatedQuestion,
        });
    } catch (error) {
        console.error("Error updating question:", error);
        res.status(500).json({ error: error.message });
    }
};

export const trackView = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = await getDataFromToken(req);
        const userIP = req.ip;

        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        let viewed = false;

        if (userId) {
            if (!question.viewedBy.includes(userId)) {
                question.viewedBy.push(userId);
                question.views++;
                viewed = true;
            }
        } else {
            if (!question.viewedIPs.includes(userIP)) {
                question.viewedIPs.push(userIP);
                question.views++;
                viewed = true;
            }
        }

        if (viewed) {
            await question.save();
        }

        return res.json({ views: question.views });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// User follows a question
export const followQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const currentUserId = await getDataFromToken(req);

        // Check if question and user exist
        const question = await Question.findById(questionId);
        const currentUser = await RegularUser.findById(currentUserId);

        if (!question || !currentUser) {
            return res.status(404).json({ error: "Question or User not found" });
        }

        // Check if already following
        const alreadyFollowing = await Follow.findOne({
            follower: currentUserId,
            followingType: "Question",
            following: questionId,
        });

        if (alreadyFollowing) {
            return res.status(400).json({ error: "Already following this question" });
        }

        // Create follow document
        await Follow.create({
            follower: currentUserId,
            followingType: "Question",
            following: questionId,
        });

        return res.status(200).json({ message: "Followed" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User unfollows a question
export const unfollowQuestion = async (req, res) => {
    try {
        const questionId = req.params.id;
        const currentUserId = await getDataFromToken(req);

        // Check if question and user exist
        const question = await Question.findById(questionId);
        const currentUser = await RegularUser.findById(currentUserId);

        if (!question || !currentUser) {
            return res.status(404).json({ error: "Question or User not found" });
        }

        // Delete follow document
        const result = await Follow.findOneAndDelete({
            follower: currentUserId,
            followingType: "Question",
            following: questionId,
        });

        if (!result) {
            return res.status(400).json({ error: "You are not following this question" });
        }

        res.json({ message: "Question unfollowed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const userId = await getDataFromToken(req);

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ error: "Question not found." });
        }

        const user = await RegularUser.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        if (!question.author.equals(user._id)) {
            return res.status(403).json({ error: "You don't have permission to delete this question." });
        }

        // 1. Check if there are any answers
        const answerCount = await Answer.countDocuments({ question: questionId });
        if (answerCount > 0) {
            return res.status(400).json({
                error: "You cannot delete this question as others have invested time and effort into answering it.",
            });
        }

        // 2. Check if anyone is following this question
        const followerCount = await Follow.countDocuments({
            followingType: "Question",
            following: questionId
        });
        if (followerCount > 0) {
            return res.status(400).json({
                error: "You cannot delete this question as others are following it.",
            });
        }

        await Question.findByIdAndDelete(questionId);
        await Answer.deleteMany({ question: questionId });

        // ✅ Update user reputation (-10 points for asking a question)
        await updateReputation(user._id, "DELETE_QUESTION");

        return res.status(200).json({
            message: "Question and related answers deleted successfully.",
        });

    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

// Get all questions a user is following
export const getFollowedQuestions = async (req, res) => {
    try {
        const userId = req.params.id; // or from token
        const follows = await Follow.find({
            follower: userId,
            followingType: "Question",
        });
        const questionIds = follows.map(f => f.following);
        res.json(questionIds);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const trendingQuestions = async (req, res) => {
    try {
        const [allQuestions, allVotes] = await Promise.all([
            Question.find({}).select("title slug createdAt").lean(),
            Vote.find({}).select("question upvotes").lean(),
        ]);

        const voteMap = new Map(
            allVotes
                .filter(v => v.question)
                .map(v => [
                    v.question.toString(),
                    Array.isArray(v.upvotes) ? v.upvotes.length : 0
                ])
        );

        const enrichedQuestions = allQuestions.map(q => ({
            _id: q._id,
            title: q.title,
            slug: q.slug,
            createdAt: q.createdAt,
            upvoteCount: voteMap.get(String(q._id)) || 0
        }));

        enrichedQuestions.sort((a, b) => {
            if (a.upvoteCount !== b.upvoteCount)
                return b.upvoteCount - a.upvoteCount;
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

        const top5Questions = enrichedQuestions.slice(0, 5);

        return res.status(200).json(
            top5Questions.map(q => ({
                _id: q._id,
                title: q.title,
                slug: q.slug,
                createdAt: q.createdAt,
                upvotes: q.upvoteCount
            }))
        );

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
