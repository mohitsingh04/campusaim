import express from "express";
import { assignGoal, getAssignedGoals, getCounselorGoals } from "../controller/goalController.js";

const goalRouter = express.Router();

goalRouter.get("/assigned-goals", getAssignedGoals);
goalRouter.post("/assign-goal", assignGoal);
goalRouter.get("/goals/:counselorId", getCounselorGoals);

export default goalRouter;