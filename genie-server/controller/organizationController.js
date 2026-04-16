import Organization from "../models/organization.js";
import User from "../models/userModel.js";
import { getDataFromToken } from "../helper/getDataFromToken.js";
import { seedQuestionsForOrganization } from "../services/questionSeeder.js";
import mongoose from "mongoose";

export const getAllOrganizations = async (req, res) => {
    try {
        const authUserId = await getDataFromToken(req);
        if (!authUserId || !mongoose.Types.ObjectId.isValid(authUserId)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const authUser = await User.findById(authUserId).select("role").lean();
        if (!authUser || authUser.role !== "superadmin") {
            return res.status(403).json({ error: "Access denied" });
        }

        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const search = req.query.search?.trim() || "";
        const skip = (page - 1) * limit;

        const searchRegex = new RegExp(search, "i");

        // 1. Define the search/match logic
        const matchStage = search ? {
            $or: [
                { "organization_name": searchRegex },
                { "website": searchRegex },
                { "createdBy.name": searchRegex },
                { "createdBy.email": searchRegex },
                { "createdBy.contact": searchRegex },
                { "nicheId.name": searchRegex }
            ]
        } : {};

        // 2. Execute Aggregation Pipeline
        const [results] = await Organization.aggregate([
            {
                $lookup: {
                    from: "users", // ensure this matches your User collection name
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy"
                }
            },
            { $unwind: { path: "$createdBy", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "niches", // ensure this matches your Niche collection name
                    localField: "nicheId",
                    foreignField: "_id",
                    as: "nicheId"
                }
            },
            { $unwind: { path: "$nicheId", preserveNullAndEmptyArrays: true } },

            // Apply Global Search
            { $match: matchStage },

            // Use Facet for parallel total count and paginated data
            {
                $facet: {
                    metadata: [{ $count: "total" }],
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                "__v": 0,
                                "createdBy.password": 0,
                                "createdBy.role": 0
                            }
                        }
                    ]
                }
            }
        ]);

        const total = results.metadata[0]?.total || 0;
        const organizations = results.data || [];

        return res.status(200).json({
            success: true,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: organizations
        });

    } catch (err) {
        console.error("getAllOrganizations error:", err);
        return res.status(500).json({ error: "Server error" });
    }
};

export const getMyOrganization = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);
        if (!adminId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // const org = await Organization.findOne({ createdBy: adminId });
        const org = await Organization.findOne();

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        res.status(200).json({ data: org });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

export const getOrganizationById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Organization id not find." });
        }

        const org = await Organization.findOne({ _id: id });

        if (!org) {
            return res.status(404).json({ error: "Organization not found" });
        }

        res.status(200).json({ data: org });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

export const upsertOrganization = async (req, res) => {
    try {
        const adminId = await getDataFromToken(req);

        if (!adminId || !mongoose.Types.ObjectId.isValid(adminId)) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { nicheId, organization_name, website } = req.body;

        if (!organization_name?.trim()) {
            return res.status(400).json({ error: "Organization name required" });
        }

        // Normalize website
        let normalizedWebsite = "";
        if (website?.trim()) {
            const url = website.trim();
            const isValidUrl = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(url);

            if (!isValidUrl) {
                return res.status(400).json({ error: "Invalid website URL" });
            }

            normalizedWebsite = url.startsWith("http")
                ? url
                : `https://${url}`;
        }

        let organization = await Organization.findOne({ createdBy: adminId });

        // 🔄 UPDATE FLOW
        if (organization) {
            organization.organization_name = organization_name.trim();
            organization.website = normalizedWebsite;

            await organization.save();

            return res.status(200).json({
                message: "Organization updated successfully",
                data: organization,
            });
        }

        // 🆕 CREATE FLOW
        if (!mongoose.Types.ObjectId.isValid(nicheId)) {
            return res.status(400).json({ error: "Invalid nicheId" });
        }

        organization = await Organization.create({
            organization_name: organization_name.trim(),
            website: normalizedWebsite,
            createdBy: adminId,
            nicheId,
        });

        await seedQuestionsForOrganization({
            nicheId,
            organizationId: organization._id,
            createdBy: adminId,
        });

        await User.findByIdAndUpdate(adminId, {
            organizationId: organization._id,
            nicheId,
        });

        return res.status(201).json({
            message: "Organization created & default questions assigned",
            data: organization,
        });
    } catch (err) {
        console.error("Upsert organization error:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
};