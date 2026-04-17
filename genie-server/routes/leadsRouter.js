import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import { authMiddleware } from "../middleware/authMiddleware.js";

import {
    addbulkLeads,
    addExternalLead,
    addLead,
    createPublicLead,
    deleteLead,
    deleteMultiLeads,
    followUps,
    getLeadById,
    getLeads,
    getLeadTimeline,
    getUserLeads,
    updateLead,
    updateLeadStatus,
} from "../controller/leadsController.js";

import {
    addOrUpdateLeadConversation,
    getAllLeadConversations,
    getConversationByLeadId
} from "../controller/leadConversationController.js";

const leadsRouter = express.Router();

/* ---------------- TEMP DIR ---------------- */
const tempStoragePath = path.resolve("../genie-media/temp");
if (!fs.existsSync(tempStoragePath)) {
    fs.mkdirSync(tempStoragePath, { recursive: true });
}

/* ---------------- FILE FILTER ---------------- */
const allowedImageTypes = /jpeg|jpg|png|pdf/;

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowed =
        allowedImageTypes.test(ext) &&
        allowedImageTypes.test(file.mimetype);

    if (!isAllowed) {
        return cb(new Error("Invalid file type"), false);
    }
    cb(null, true);
};

/* ---------------- DISK STORAGE ---------------- */
const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, tempStoragePath),
    filename: (req, file, cb) => {
        const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${suffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB per file
});

/* ---------------- MEMORY STORAGE (EXCEL) ---------------- */
const memoryUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Excel
    fileFilter: (_, file, cb) => {
        if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only Excel files allowed"));
        }
    }
});

/* ================= LEADS (STATIC FIRST) ================= */

// All leads visible to auth user
leadsRouter.get("/leads", authMiddleware, getLeads);

// Bulk operations
leadsRouter.post("/add-bulk-leads", authMiddleware, memoryUpload.single("file"), addbulkLeads);
leadsRouter.delete("/delete-multiple-leads", authMiddleware, deleteMultiLeads);

// Create lead
leadsRouter.post("/leads", authMiddleware, addLead);
leadsRouter.post("/add/test/leads", createPublicLead);
leadsRouter.post("/external/leads", addExternalLead);

/* ================= USER-SCOPED LEADS ================= */

// Leads of a specific user (admin / partner / teamleader)
leadsRouter.get("/follow-ups", authMiddleware, followUps);
leadsRouter.get("/users/:userId/leads", authMiddleware, getUserLeads);


/* ================= LEAD CONVERSATIONS ================= */

leadsRouter.post("/lead/conversation", authMiddleware, addOrUpdateLeadConversation);
leadsRouter.get("/lead/conversation", authMiddleware, getAllLeadConversations);
leadsRouter.get("/lead/conversation/:lead_id", authMiddleware, getConversationByLeadId);


/* ================= LEADS (DYNAMIC LAST) ================= */

// Single lead CRUD (⚠️ MUST BE LAST)
leadsRouter.get("/leads/:id", authMiddleware, getLeadById);
leadsRouter.get("/leads/timeline/:id", getLeadTimeline);
leadsRouter.put("/leads/:id", authMiddleware, updateLead);
leadsRouter.put("/leads/update-status/:id", authMiddleware, updateLeadStatus);
leadsRouter.delete("/leads/:id", authMiddleware, deleteLead);


export default leadsRouter;
