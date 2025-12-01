import bodyParser from "body-parser";
import express from "express";
import {
  PrernaAIChatByObjectId,
  PrernaAI,
  PrernaAIChatHistory,
  PrernaAIPropertySearchSummaryData,
  PrernaAIPropertySearch,
} from "../ai-controller/PrernaAi.js";
import Authorize from "../utils/Authorization.js";

const AiRoutes = express.Router();
AiRoutes.use(bodyParser.json());
AiRoutes.use(bodyParser.urlencoded({ extended: true }));

AiRoutes.post("/ai/prerna", Authorize, PrernaAI);
AiRoutes.post("/ai/prerna/property", Authorize, PrernaAIPropertySearch);
AiRoutes.get(
  "/ai/prerna/property/chat/:objectId",
  Authorize,
  PrernaAIChatByObjectId
);
AiRoutes.get(
  "/ai/prerna/property/histroy/:userId",
  Authorize,
  PrernaAIChatHistory
);
AiRoutes.post(
  "/ai/prerna/property/summary",
  Authorize,
  PrernaAIPropertySearchSummaryData
);

export default AiRoutes;
