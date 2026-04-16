import express from "express";
import {
    upsertComission,
    getPartnerComission,
    deleteComission,
    getMyComission
} from "../controller/comissionController.js";

const comissionRouter = express.Router();

comissionRouter.get("/my-commission", getMyComission);
comissionRouter.post("/partner/commission", upsertComission);
comissionRouter.get("/partner/commission/:partnerId", getPartnerComission);
comissionRouter.delete("/partner/commission/:partnerId", deleteComission);

export default comissionRouter;