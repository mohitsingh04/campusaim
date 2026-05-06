import express from "express";
import { createQuestionSet, deleteQuestion, getQuestionSet, getQuestionSetById, getQuestionSetByNicheId, updateQuestion } from "../controller/questionSetController.js";
import { addQuestions, deleteMultiQuestions, deleteQuestions, getQuestionById, getQuestionsByNicheId, updateQuestions } from "../controller/questionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const questionRouter = express.Router();

/* ========== Handle by Super Admin ========== */
/* ========== Question Set (by id) ========== */
questionRouter.get("/question-set", getQuestionSet); // view full set list
questionRouter.get("/question-set/:id", getQuestionSetById); // view full set
questionRouter.get("/question-set/list/:nicheId", getQuestionSetByNicheId); // view full set

/* ========== Embedded Questions (by order) ========== */
questionRouter.post("/question-set", createQuestionSet);
questionRouter.put("/question-set/:id", updateQuestion); // update question
questionRouter.delete("/delete-question-set/:id", deleteQuestion); // delete question

/* ========== Handle by Admin ========== */
questionRouter.get("/questions/:questionId/view", getQuestionById);
questionRouter.get("/questions/niche/:nicheId", getQuestionsByNicheId);
questionRouter.post("/questions", addQuestions);
questionRouter.put("/questions/:questionId", updateQuestions);
questionRouter.delete("/delete-questions/:id", authMiddleware, deleteQuestions);
questionRouter.delete("/delete-multiple-questions", authMiddleware, deleteMultiQuestions);

export default questionRouter;