import BestFor from "../models/BestFor.js";

export const CreateBestFor = async (req, res) => {
    try {
        const { best_for } = req.body;

        const existingBestFor = await BestFor.findOne({ best_for });

        if (existingBestFor) {
            return res.status(400).json({ error: "Already exists." });
        }

        const lastDoc = await BestFor.findOne().sort({ uniqueId: -1 });
        const uniqueId = lastDoc ? lastDoc?.uniqueId + 1 : 1;

        const newBestFor = new BestFor({
            uniqueId,
            best_for,
        });

        await newBestFor.save();

        return res
            .status(201)
            .json({ message: "BestFor created successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAllBestFor = async (req, res) => {
    try {
        const bestFor = await BestFor.find();

        if (!bestFor) {
            return res.status(404).json({ error: "BestFor Not Found" });
        }

        return res.status(200).json(bestFor);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getBestForById = async (req, res) => {
    try {
        const { objectId } = req.params;
        const bestFor = await BestFor.findById(objectId);

        if (!bestFor) {
            return res.status(404).json({ error: "BestFor Not Found" });
        }

        return res.status(200).json(bestFor);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Update Requirement
export const updateBestFor = async (req, res) => {
    try {
        const { objectId } = req.params;
        const { best_for } = req.body; // field coming from frontend

        const bestFor = await BestFor.findById(objectId);

        if (!bestFor) {
            return res.status(404).json({ error: "BestFor Not Found" });
        }

        bestFor.best_for =
            best_for || bestFor.best_for;

        await bestFor.save();

        return res.status(200).json({
            message: "BestFor Updated Successfully",
            data: bestFor,
        });
    } catch (error) {
        console.error("Update Requirement Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteBestFor = async (req, res) => {
    try {
        const { objectId } = req.params;

        const bestFor = await BestFor.findById(objectId);

        if (!bestFor) {
            return res.status(404).json({ error: "BestFor Not Found" });
        }

        await BestFor.findByIdAndDelete(objectId);

        return res.status(200).json({
            message: "BestFor deleted successfully",
        });
    } catch (error) {
        console.error("Delete BestFor Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};