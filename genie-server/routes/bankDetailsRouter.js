import express from "express";
import { getBankDetailsById, updateBankDetails } from "../controller/bankDetailsController.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const bankDetailsRouter = express.Router();

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

bankDetailsRouter.get("/bank-details/:userId", getBankDetailsById);
bankDetailsRouter.put("/bank-details/:userId", upload.fields([{ name: 'passbookOrCancelCheckbookImg', maxCount: 1 }]), updateBankDetails);

export default bankDetailsRouter;