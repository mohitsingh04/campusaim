import Documents from "../models/documentsModel.js";
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

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

export const getDocumentsById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId || typeof userId !== "string") {
            return res.status(400).json({ error: "Invalid or missing userId" });
        }

        const documents = await Documents.findOne({ userId });

        if (!documents) {
            return res.status(404).json({ error: "Documents not found" });
        }

        return res.status(200).json({ success: true, data: documents });
    } catch (error) {
        console.error("Error in getDocumentsById:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateDocuments = async (req, res) => {
    try {
        const { userId } = req.params;
        const { aadhaarCardNumber, panCardNumber } = req.body;

        const existing = await Documents.findOne({ userId });

        const docsPath = `../genie-media/documents/${userId}/`;
        ensureDirectoryExistence(docsPath);

        // AADHAAR FRONT
        let aadhaarCardFrontImgPath = existing?.aadhaarCardFrontImg || null;
        let aadhaarCardFrontImgCompressedPath = existing?.aadhaarCardFrontImgCompressed || null;
        if (req.files?.aadhaarCardFrontImg) {
            if (existing) {
                await deleteFileIfExists(existing.aadhaarCardFrontImg);
                await deleteFileIfExists(existing.aadhaarCardFrontImgCompressed);
            }

            const file = req.files.aadhaarCardFrontImg[0];
            const ext = path.extname(file.originalname).toLowerCase();
            const baseName = path.basename(file.filename, ext);

            const original = `${docsPath}${baseName}${ext}`;
            const compressed = `${docsPath}${baseName}-compressed.webp`;

            await fs.promises.rename(file.path, original);
            await sharp(original).toFormat("webp").toFile(compressed);

            aadhaarCardFrontImgPath = original;
            aadhaarCardFrontImgCompressedPath = compressed;
        }

        // AADHAAR BACK
        let aadhaarCardBackImgPath = existing?.aadhaarCardBackImg || null;
        let aadhaarCardBackImgCompressedPath = existing?.aadhaarCardBackImgCompressed || null;
        if (req.files?.aadhaarCardBackImg) {
            if (existing) {
                await deleteFileIfExists(existing.aadhaarCardBackImg);
                await deleteFileIfExists(existing.aadhaarCardBackImgCompressed);
            }

            const file = req.files.aadhaarCardBackImg[0];
            const ext = path.extname(file.originalname).toLowerCase();
            const baseName = path.basename(file.filename, ext);

            const original = `${docsPath}${baseName}${ext}`;
            const compressed = `${docsPath}${baseName}-compressed.webp`;

            await fs.promises.rename(file.path, original);
            await sharp(original).toFormat("webp").toFile(compressed);

            aadhaarCardBackImgPath = original;
            aadhaarCardBackImgCompressedPath = compressed;
        }

        // PAN CARD
        let panCardFrontImgPath = existing?.panCardFrontImg || null;
        let panCardFrontImgCompressedPath = existing?.panCardFrontImgCompressed || null;
        if (req.files?.panCardFrontImg) {
            if (existing) {
                await deleteFileIfExists(existing.panCardFrontImg);
                await deleteFileIfExists(existing.panCardFrontImgCompressed);
            }

            const file = req.files.panCardFrontImg[0];
            const ext = path.extname(file.originalname).toLowerCase();
            const baseName = path.basename(file.filename, ext);

            const original = `${docsPath}${baseName}${ext}`;
            const compressed = `${docsPath}${baseName}-compressed.webp`;

            await fs.promises.rename(file.path, original);
            await sharp(original).toFormat("webp").toFile(compressed);

            panCardFrontImgPath = original;
            panCardFrontImgCompressedPath = compressed;
        }

        // Save or Update
        const updated = await Documents.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    aadhaarCardNumber: aadhaarCardNumber?.trim() || existing?.aadhaarCardNumber || "",
                    aadhaarCardFrontImg: aadhaarCardFrontImgPath,
                    aadhaarCardFrontImgCompressed: aadhaarCardFrontImgCompressedPath,
                    aadhaarCardBackImg: aadhaarCardBackImgPath,
                    aadhaarCardBackImgCompressed: aadhaarCardBackImgCompressedPath,
                    panCardNumber: panCardNumber?.trim().toUpperCase() || existing?.panCardNumber || "",
                    panCardFrontImg: panCardFrontImgPath,
                    panCardFrontImgCompressed: panCardFrontImgCompressedPath,
                },
            },
            { new: true, upsert: true }
        );

        return res.status(200).json({
            success: true,
            message: existing ? "Documents updated successfully." : "Documents uploaded successfully.",
            data: updated,
        });
    } catch (error) {
        console.error("Error in updateDocuments:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};