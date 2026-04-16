import express from "express";
import { createQuestionSet, deleteQuestion, getQuestionSet, getQuestionSetByNicheId, getQuestionSetBySlug, updateQuestion } from "../controller/questionSetController.js";
import { addQuestions, deleteMultiQuestions, deleteQuestions, getAddedQuestions, getQuestionById, getQuestionsByOrganizationId, updateQuestions } from "../controller/questionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const questionRouter = express.Router();

/* ========== Handle by Super Admin ========== */
/* ========== Question Set (by slug) ========== */
questionRouter.get("/question-set", getQuestionSet); // view full set list
questionRouter.get("/question-set/:slug", getQuestionSetBySlug); // view full set
questionRouter.get("/question-set/list/:nicheId", getQuestionSetByNicheId); // view full set

/* ========== Embedded Questions (by order) ========== */
questionRouter.post("/question-set", createQuestionSet);
questionRouter.put("/question-set/:slug", updateQuestion); // update question
questionRouter.delete("/delete-question-set/:id", deleteQuestion); // delete question

/* ========== Handle by Admin ========== */
questionRouter.get("/questions/added", getAddedQuestions);
questionRouter.get("/questions/:questionId/view", getQuestionById);
questionRouter.get("/questions/organization/:organizationId", getQuestionsByOrganizationId);
questionRouter.post("/questions", addQuestions);
questionRouter.put("/questions/:questionId", updateQuestions);
questionRouter.delete("/delete-questions/:id", authMiddleware, deleteQuestions);
questionRouter.delete("/delete-multiple-questions", authMiddleware, deleteMultiQuestions);

export default questionRouter;