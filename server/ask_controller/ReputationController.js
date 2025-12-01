import Reputation from "../ask_model/Reputation.js";

export async function updateReputation(userId, action, undo = false) {
  const POINTS = {
    ASK_QUESTION: 10,
    DELETE_QUESTION: -10,
    POST_ANSWER: 10,
    DELETE_ANSWER: -10,
    UPVOTE_QUESTION: 1,
    DOWNVOTE_QUESTION: -1,
    UPVOTE_ANSWER: 1,
    DOWNVOTE_ANSWER: -1,
  };
  let points = POINTS[action];
  if (undo) points = -points;

  let rep = await Reputation.findOne({ author: userId });
  if (!rep) {
    rep = new Reputation({ author: userId, score: 0 });
  }
  rep.score += points;
  await rep.save();
  return rep.score;
}

export const getReputationById = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(404).json({ error: "User ID not found." });
    }

    const reputation = await Reputation.findOne({ author: userId });

    return res.status(200).json(reputation);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
