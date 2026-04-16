import express from "express";
import { addNiche, deleteNiche, getNiche, getNicheById, getNicheBySlug, getNicheOptions, updateNiche } from "../controller/nicheController.js";

const nicheRouter = express.Router();

nicheRouter.get("/niche", getNiche);
nicheRouter.get("/niche/options", getNicheOptions);
nicheRouter.get("/niche/:id", getNicheById);
nicheRouter.get("/niche/:slug/get", getNicheBySlug);
nicheRouter.post("/niche", addNiche);
nicheRouter.put("/niche/:id", updateNiche);
nicheRouter.delete("/niche/:id", deleteNiche);

export default nicheRouter;