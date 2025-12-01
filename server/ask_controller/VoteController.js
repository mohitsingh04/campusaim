import Vote from "../ask_model/Vote.js";
import Answer from "../ask_model/Answer.js";
import Question from "../ask_model/Question.js";
import { updateReputation } from "./ReputationController.js";
import { getDataFromToken } from "../utils/getDataFromToken.js"; // make sure you have this

// ---------- Helper Function ----------
const handleVote = async (req, res, type, voteType) => {
    try {
        const { id } = req.params; // questionId or answerId
        const userId = await getDataFromToken(req);

        if (!userId) return res.status(404).json({ error: "User not found" });

        const Model = type === "question" ? Question : Answer;
        const content = await Model.findById(id);
        if (!content) return res.status(404).json({ error: `${type} not found` });

        const authorId = content.author.toString();

        // Prevent self-voting
        if (userId === authorId) {
            return res.status(403).json({ error: `You can't ${voteType} your own ${type}.` });
        }

        // Find or create vote record
        let voteDoc = await Vote.findOne({ [type]: id });
        if (!voteDoc) {
            voteDoc = await Vote.create({ [type]: id, upvotes: [], downvotes: [] });
        }

        const isUpvote = voteType === "upvote";
        const currentVotes = isUpvote ? voteDoc.upvotes : voteDoc.downvotes;
        const oppositeVotes = isUpvote ? voteDoc.downvotes : voteDoc.upvotes;

        // Toggle vote logic
        if (currentVotes.includes(userId)) {
            // Remove existing vote (toggle off)
            currentVotes.pull(userId);
            await updateReputation(
                authorId,
                `${voteType.toUpperCase()}_${type.toUpperCase()}`,
                true
            );
        } else {
            // Add new vote
            currentVotes.push(userId);

            // Remove from opposite votes if exists
            if (oppositeVotes.includes(userId)) {
                oppositeVotes.pull(userId);
                await updateReputation(
                    authorId,
                    `${isUpvote ? "DOWNVOTE" : "UPVOTE"}_${type.toUpperCase()}`,
                    true
                );
            }

            await updateReputation(authorId, `${voteType.toUpperCase()}_${type.toUpperCase()}`);
        }

        await voteDoc.save();

        // --- THIS IS THE IMPORTANT PART ---
        res.json({
            upvotes: voteDoc.upvotes.length,
            downvotes: voteDoc.downvotes.length,
            hasUpvoted: voteDoc.upvotes.map(String).includes(String(userId)),
            hasDownvoted: voteDoc.downvotes.map(String).includes(String(userId)),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

// ---------- Question Votes ----------
export const upvoteQuestion = (req, res) => handleVote(req, res, "question", "upvote");
export const downvoteQuestion = (req, res) => handleVote(req, res, "question", "downvote");

// ---------- Answer Votes ----------
export const upvoteAnswer = (req, res) => handleVote(req, res, "answer", "upvote");
export const downvoteAnswer = (req, res) => handleVote(req, res, "answer", "downvote");
