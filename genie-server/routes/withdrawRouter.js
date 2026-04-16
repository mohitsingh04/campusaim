import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
    requestWithdraw,
    getWithdrawRequests,
    approveWithdraw,
    rejectWithdraw,
    getMyWithdrawRequests
} from "../controller/withdrawController.js";

const withdrawRouter = express.Router();

// counselor
withdrawRouter.post("/request-withdraw", authMiddleware, requestWithdraw);
// counselor history
withdrawRouter.get("/my-withdraws", authMiddleware, getMyWithdrawRequests);

// admin
withdrawRouter.get("/withdraw-request", authMiddleware, getWithdrawRequests);
withdrawRouter.patch("/withdraw-request/:id/approve", authMiddleware, approveWithdraw);
withdrawRouter.patch("/withdraw-request/:id/reject", authMiddleware, rejectWithdraw);

export default withdrawRouter;