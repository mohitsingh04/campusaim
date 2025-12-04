import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { downloadImageAndReplaceSrc } from "../helper/folder-cleaners/EditorImagesController.js";
import Announcement from "../models/Announcement.js";

export const getAllAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.find();
        if (!announcement) {
            return res.status(404).json({ error: "Announcement Not Found" });
        }

        return res.status(200).json(announcement);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAnnouncementByPropertyId = async (req, res) => {
    try {
        const { property_id } = req.params;
        const announcement = await Announcement.find({ property_id: property_id });
        if (!announcement) {
            return res.status(404).json({ error: "Announcement Not Found" });
        }

        return res.status(200).json(announcement);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const AddAnnouncement = async (req, res) => {
    try {
        const {
            userId,
            property_id,
            announcement,
        } = req.body;

        if (!userId && !property_id) {
            return res.status(400).json({ error: "All Field Required" });
        }

        let updatedAnnouncement = announcement;
        if (announcement) {
            updatedAnnouncement = await downloadImageAndReplaceSrc(
                announcement,
                property_id
            );
        }

        const newAnnouncement = new Announcement({
            userId,
            property_id,
            announcement,
        });

        await newAnnouncement.save();

        const announcementCount = await Announcement.find({
            property_id: property_id,
        });
        if (announcementCount.length === 1) {
            await addPropertyScore({
                property_id,
                property_score: 10,
            });
        }

        return res
            .status(201)
            .json({ message: "Announcement successfully" });
    } catch (error) {
        console.error("Add Announcement Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const EditAnnouncement = async (req, res) => {
    try {
        const { objectId } = req.params;
        const { property_id, announcement } = req.body;

        if (!mongoose.Types.ObjectId.isValid(objectId)) {
            return res.status(400).json({ error: "Invalid objectId" });
        }

        const existingAnnouncement = await Announcement.findById(objectId);
        if (!existingAnnouncement) {
            return res.status(404).json({ error: "Announcement not found." });
        }

        const duplicateAnnouncement = await Announcement.findOne({
            _id: { $ne: objectId },
            property_id,
            announcement: announcement,
        });

        if (duplicateAnnouncement) {
            return res.status(400).json({
                error:
                    "Another announcement with the same name already exists for this property.",
            });
        }

        let updatedAnnouncementContent = existingAnnouncement.announcement;
        if (typeof announcement !== "undefined" && announcement !== null) {
            updatedAnnouncementContent = await downloadImageAndReplaceSrc(
                announcement,
                property_id
            );
        }

        const updatedDoc = await Announcement.findByIdAndUpdate(
            objectId,
            {
                $set: {
                    announcement: updatedAnnouncementContent,
                },
            },
            { new: true, runValidators: true }
        );

        return res
            .status(200)
            .json({ message: "Announcement updated successfully", data: updatedDoc });
    } catch (error) {
        console.error("Edit Announcement Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};