import mongoose from "mongoose";
import Organization from "../models/organization.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";

export const fetchMyOrganization = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);

        // ---------- Validation ----------
        if (!authUserId || !mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({
                success: false,
                error: "Unauthorized"
            });
        }

        // ---------- Correct Query ----------
        const organization = await Organization.findOne({owner: authUserId}).lean();

        return res.status(200).json({
            success: true,
            data: organization
        });
    } catch (error) {
        console.error("fetchMyOrganization error:", error);
        return res.status(500).json({
            success: false,
            error: "Internal Server Error"
        });
    }
};