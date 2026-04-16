import express from "express";
import { getAllOrganizations, getMyOrganization, getOrganizationById, upsertOrganization } from "../controller/organizationController.js";

const organizationRouter = express.Router();

organizationRouter.get("/organization/all", getAllOrganizations);
organizationRouter.get("/organization/me", getMyOrganization);
organizationRouter.put("/organization", upsertOrganization);
organizationRouter.get("/organization/:id", getOrganizationById);

export default organizationRouter;