import express from "express";
import { getDocumentsById, updateDocuments } from "../controller/documentsController.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const documentsRouter = express.Router();

const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const tempStoragePath = "../genie-media/temp/";
ensureDirectoryExistence(tempStoragePath)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempStoragePath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage })

documentsRouter.get("/documents/:userId", getDocumentsById);
documentsRouter.put("/documents/:userId", upload.fields([{ name: 'aadhaarCardFrontImg', maxCount: 1 }, { name: 'aadhaarCardBackImg', maxCount: 1 }, { name: 'panCardFrontImg', maxCount: 1 }]), updateDocuments);

export default documentsRouter;