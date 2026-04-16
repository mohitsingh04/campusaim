// routes/supportRoutes.js
import express from "express";
import { createSupport, getAllSupport, getMySupport, getSupportById, updateMySupport, updateSupportStatus } from "../controller/supportController.js";

const supportRouter = express.Router();

// public
supportRouter.post("/support", createSupport);

// admin (protect with middleware if needed)
supportRouter.get("/support", getAllSupport);
supportRouter.get("/support/my", getMySupport);
supportRouter.get("/support/:id", getSupportById);
supportRouter.put("/support/:id", updateMySupport);
supportRouter.put("/support/status/:id", updateSupportStatus);

export default supportRouter;