import express from "express";
import { getApiHealth, getDatabaseHealth, getDiskHealth, getServerHealth } from "../controller/systemHealthController.js";

const systemHealthRouter = express.Router();

systemHealthRouter.get("/server", getServerHealth);
systemHealthRouter.get("/database", getDatabaseHealth);
systemHealthRouter.get("/api", getApiHealth);
systemHealthRouter.get("/disk", getDiskHealth);

export default systemHealthRouter;