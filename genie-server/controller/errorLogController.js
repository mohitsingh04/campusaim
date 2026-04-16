import mongoose from "mongoose";
import ErrorLog from "../models/errorLogSchema.js";

export const getErrorLogs = async (req, res) => {
    try {
        // Enforce radix and prevent NaN propagation if query params are malformed strings
        const rawPage = parseInt(req.query.page, 10);
        const rawLimit = parseInt(req.query.limit, 10);

        const page = Number.isInteger(rawPage) ? Math.max(rawPage, 1) : 1;
        const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 20;

        const search = (req.query.search || "").trim();
        const role = (req.query.role || "").trim();

        const filter = {};

        if (search) {
            // SECURITY: Escape regex characters to prevent Regular Expression Denial of Service (ReDoS)
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

            filter.$or = [
                { message: { $regex: escapedSearch, $options: "i" } },
                { page: { $regex: escapedSearch, $options: "i" } },
            ];
        }

        if (role) {
            filter.userRole = role;
        }

        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            ErrorLog.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(), // lean() is excellent here for read-only performance
            ErrorLog.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("[getErrorLogs] Fetch failed:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch error logs",
        });
    }
};

export const logFrontendError = async (req, res) => {
    try {
        const {
            message,
            stack,
            page,
            method,
            userRole,
            browser,
            device
        } = req.body;

        const error = await ErrorLog.create({
            message,
            stack,
            page,
            method,
            userRole,
            browser,
            device,
            userId: req.user?.id || null,
            ip: req.ip,
        });

        res.status(201).json({
            success: true,
            errorId: error._id,
        });
    } catch (err) {
        console.error("Error logging failed:", err);
        res.status(500).json({ success: false });
    }
};

export const deleteErrorLog = async (req, res) => {
    try {
        const { id } = req.params;

        // validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid error log ID",
            });
        }

        const log = await ErrorLog.findByIdAndDelete(id);

        if (!log) {
            return res.status(404).json({
                success: false,
                message: "Error log not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Error log deleted successfully",
        });

    } catch (error) {
        console.error("Delete error log failed:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while deleting log",
        });
    }
};

export const deleteMultipleErrorLogs = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "IDs array is required",
            });
        }

        const validIds = ids.filter((id) =>
            mongoose.Types.ObjectId.isValid(id)
        );

        const result = await ErrorLog.deleteMany({
            _id: { $in: validIds },
        });

        return res.status(200).json({
            success: true,
            message: "Error logs deleted",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Bulk delete failed:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const deleteAllErrorLogs = async (req, res) => {
    try {
        const result = await ErrorLog.deleteMany({});

        return res.status(200).json({
            success: true,
            message: "All error logs deleted",
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Delete all logs failed:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};