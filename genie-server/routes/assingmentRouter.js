import express from "express";
import { assignCounselorToTeamLeader, assignLeads, getAssignedCounselors } from "../controller/assignmentController.js";

const assingmentRouter = express.Router();

assingmentRouter.get("/users/teamleaders/:teamLeaderId/counselors", getAssignedCounselors);

// Assign Counselor to Teamleader
assingmentRouter.put("/users/:counselorId/assign-teamleader", assignCounselorToTeamLeader);

// Assign Lead
assingmentRouter.put("/assign/lead", assignLeads);

export default assingmentRouter;