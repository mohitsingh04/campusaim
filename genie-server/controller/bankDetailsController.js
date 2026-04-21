import BankDetails from "../models/bankDetailsModel.js";
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ensureDirectoryExistence = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const deleteFileIfExists = async (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
    }
};

export const getBankDetailsById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid or missing userId" });
        }

        const data = await BankDetails.findOne({ userId });

        if (!data) {
            return res.status(404).json({ error: "Bank details not found" });
        }

        return res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error("Error in getBankDetailsById:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateBankDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            beneficiaryName,
            accountNumber,
            bankName,
            ifscCode,
        } = req.body;

        const existing = await BankDetails.findOne({ userId });

        const docsPath = `../media/bank-details/${userId}/`;
        ensureDirectoryExistence(docsPath);

        let passbookImagePath = existing?.passbookOrCancelCheckbookImg || null;
        let compressedImagePath = existing?.passbookOrCancelCheckbookImgCompressed || null;

        // If new file uploaded, handle image processing
        if (req.files?.passbookOrCancelCheckbookImg?.[0]) {
            const file = req.files.passbookOrCancelCheckbookImg[0];

            // Remove old files
            if (existing) {
                await deleteFileIfExists(existing.passbookOrCancelCheckbookImg);
                await deleteFileIfExists(existing.passbookOrCancelCheckbookImgCompressed);
            }

            const ext = path.extname(file.originalname).toLowerCase();
            const baseName = path.basename(file.filename, ext);

            const originalPath = path.join(docsPath, `${baseName}${ext}`);
            const compressedPath = path.join(docsPath, `${baseName}-compressed.webp`);

            // Move and compress image
            await fs.promises.rename(file.path, originalPath);
            await sharp(originalPath).toFormat('webp').toFile(compressedPath);

            passbookImagePath = originalPath;
            compressedImagePath = compressedPath;
        }

        // Save or update bank details
        const updated = await BankDetails.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    beneficiaryName: beneficiaryName?.trim() || existing?.beneficiaryName,
                    accountNumber: accountNumber?.trim() || existing?.accountNumber,
                    bankName: bankName?.trim() || existing?.bankName,
                    ifscCode: ifscCode?.trim().toUpperCase() || existing?.ifscCode,
                    passbookOrCancelCheckbookImg: passbookImagePath,
                    passbookOrCancelCheckbookImgCompressed: compressedImagePath,
                },
            },
            { new: true, upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: existing
                ? 'Bank Details updated successfully.'
                : 'Bank Details uploaded successfully.',
            data: updated,
        });
    } catch (error) {
        console.error('Error in updateBankDetails:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};