import express from "express";
import { createQuestion, deleteQuestion, followQuestion, getAllQuestions, getFollowedQuestions, getQuestionById, getQuestionDetail, trackView, trendingQuestions, unfollowQuestion, updateQuestion } from "../ask_controller/QuestionController.js";
import { createAnswer, deleteAnswer, getAnswers, getAnswersById, getAnswersByQuestion, getAnswersWithQuestions, updateAnswer } from "../ask_controller/AnswerController.js";
import { createComment, getComments, getCommentsByAnswer, getCommentsByQuestion } from "../ask_controller/CommentController.js";
import { fetchAllUsers, fetchSingleUser, fetchTopUsers, followUser, getFollowers, getFollowing, myProfile, token, unfollowUser } from "../ask_controller/UserController.js";
import { getNotifications, markNotificationAsRead } from "../ask_controller/NotificationController.js";
import { getCategories, getCategoriesById, topCategories } from "../ask_controller/CategoryController.js";
import { getReputationById } from "../ask_controller/ReputationController.js";
import { downvoteAnswer, downvoteQuestion, upvoteAnswer, upvoteQuestion } from "../ask_controller/VoteController.js";

const askRouter = express.Router();

/* ---------------- USER ROUTES ---------------- */
askRouter.get("/token", token);
askRouter.get("/profile", myProfile);
askRouter.get("/users", fetchAllUsers);
askRouter.get("/user/:username", fetchSingleUser);

askRouter.get("/top-users/", fetchTopUsers);

askRouter.post("/follow/:id/follow", followUser);
askRouter.post("/follow/:id/unfollow", unfollowUser);

askRouter.get("/follow/:id/followers", getFollowers);
askRouter.get("/follow/:id/following", getFollowing);

/* ---------------- QUESTION ROUTES ---------------- */
askRouter.get("/questions", getAllQuestions);
askRouter.post("/questions", createQuestion);
askRouter.get("/questions/:id", getQuestionById);
askRouter.get("/questions/slug/:slug/details", getQuestionDetail);
askRouter.patch("/questions/:questionId", updateQuestion);
askRouter.delete("/questions/:questionId", deleteQuestion);
askRouter.get("/trending-questions", trendingQuestions);

/* ---------------- QUESTION VIEWS / UPVOTE / DOWNVOTE ROUTES ---------------- */
askRouter.post("/questions/:id/view", trackView);
askRouter.post("/questions/:id/upvote", upvoteQuestion);
askRouter.post("/questions/:id/downvote", downvoteQuestion);
askRouter.get("/users/:id/followed-questions", getFollowedQuestions);
askRouter.post("/questions/:id/follow", followQuestion);
askRouter.post("/questions/:id/unfollow", unfollowQuestion);

/* ---------------- NOTIFICATION ROUTES ---------------- */
askRouter.get("/notifications", getNotifications);
askRouter.patch("/notifications/:id/read", markNotificationAsRead);

/* ---------------- ANSWER ROUTES ---------------- */
askRouter.get("/answers", getAnswers);
askRouter.get("/answers/with-questions", getAnswersWithQuestions);
askRouter.get("/answers/:id", getAnswersById);
askRouter.get("/answers/:questionId", getAnswersByQuestion);
askRouter.post("/answers/:questionId", createAnswer);
askRouter.patch("/answers/:answerId", updateAnswer);
askRouter.delete("/answers/:answerId", deleteAnswer);

/* ---------------- ANSWER UPVOTE / DOWNVOTE ROUTES ---------------- */
askRouter.post("/answers/:id/upvote", upvoteAnswer);
askRouter.post("/answers/:id/downvote", downvoteAnswer);

/* ---------------- COMMENT ROUTES ---------------- */
askRouter.post("/comments/answer/:answerId", createComment);
askRouter.post("/comments/question/:questionId", createComment);
askRouter.get("/comments", getComments);
askRouter.get("/comments/question/:questionId", getCommentsByQuestion);
askRouter.get("/comments/answer/:answerId", getCommentsByAnswer);

/* ---------------- CATEGORY ROUTES ---------------- */
askRouter.get("/categories", getCategories);
askRouter.get("/top-categories", topCategories);
askRouter.get("/categories/:id", getCategoriesById);

/* ---------------- REPUTATION ROUTES ---------------- */
askRouter.get("/reputation/:userId", getReputationById);

export default askRouter;