import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createIncentive, deleteIncentive, getIncentive, getIncentiveWithCourses, getMyEarnings, updateIncentive } from "../controller/incentiveController.js";

const incentiveRouter = express.Router();

// Add Incentive
incentiveRouter.post("/incentives", authMiddleware, createIncentive);

// Get
incentiveRouter.get("/my-earning", authMiddleware, getMyEarnings);
incentiveRouter.get("/incentives/:userId", authMiddleware, getIncentive);
incentiveRouter.get("/incentives-with-courses/:userId", authMiddleware, getIncentiveWithCourses);
incentiveRouter.delete("/incentives/:userId", deleteIncentive);

// Update Incentive
incentiveRouter.put("/incentives/:id", authMiddleware, updateIncentive);

export default incentiveRouter;