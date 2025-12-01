import { Support, SupportMessage } from "../analytic-model/Support.js";
import SupportFeedback from "../analytic-model/SupportFeedback.js";
import { moveSupportFiles } from "../helper/folder-cleaners/SupportFileMover.js";

import fs from "node:fs/promises";
import path from "node:path";

export const DeleteSupportQuery = async (req, res) => {
  try {
    const { supportId } = req.params;

    if (!supportId) {
      return res.status(400).json({ error: "Support ID is required" });
    }

    const mediaPathFromRoot = path.join("..", "media", "support", supportId);
    const resolvedFolderPath = path.resolve(process.cwd(), mediaPathFromRoot);
    const allowedBase = path.resolve(process.cwd(), "..", "media", "support");

    let folderExists = false;
    try {
      const stat = await fs.stat(resolvedFolderPath);
      folderExists = stat.isDirectory();
    } catch {
      folderExists = false;
    }

    const [supportResult, messageResult, feedbackResult] = await Promise.all([
      Support.deleteMany({ _id: supportId }),
      SupportMessage.deleteMany({ supportId }),
      SupportFeedback.deleteMany({ supportId }),
    ]);

    const allDeleted =
      (supportResult?.deletedCount ?? 0) > 0 &&
      (messageResult?.deletedCount ?? 0) > 0 &&
      (feedbackResult?.deletedCount ?? 0) > 0;

    if (folderExists && allDeleted) {
      if (
        resolvedFolderPath.startsWith(allowedBase + path.sep) ||
        resolvedFolderPath === allowedBase
      ) {
        try {
          await fs.rm(resolvedFolderPath, { recursive: true, force: true });
          console.log(`Deleted media folder: ${resolvedFolderPath}`);
        } catch (folderErr) {
          console.warn(
            `Could not delete folder: ${resolvedFolderPath}`,
            folderErr.message
          );
        }
      } else {
        console.warn(
          `Blocked attempt to delete outside allowed dir. resolved="${resolvedFolderPath}", allowed="${allowedBase}"`
        );
        return res.status(400).json({
          error: "Invalid media path. Deletion blocked for safety.",
        });
      }
    }

    if (allDeleted) {
      return res.status(200).json({
        messag: "Support chat deleted successfully.",
      });
    } else {
      return res.status(404).json({
        message: "Not all support data found.",
      });
    }
  } catch (error) {
    console.error("❌ Error deleting support query:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const startSupportQuery = async (req, res) => {
  try {
    const { userId, subject, text } = req.body;

    if (!userId || !subject) {
      return res
        .status(400)
        .json({ message: "userId and subject are required" });
    }

    let fileNames = [];
    if (req.files && req.files.files) {
      fileNames = req.files.files.map((file) => file.filename);
    }

    // Create support query
    const support = await Support.create({
      userId,
      subject,
    });

    // Move uploaded files into the supportId folder
    let movedFiles = [];
    if (fileNames.length > 0) {
      movedFiles = await moveSupportFiles(support._id, fileNames);
    }

    // Create first message
    let message = null;
    if (text || movedFiles.length > 0) {
      message = await SupportMessage.create({
        supportId: support._id,
        userId,
        senderType: "user",
        text,
        files: movedFiles,
      });
    }

    return res.status(201).json({
      message: "Support query started successfully",
      support,
      firstMessage: message,
    });
  } catch (error) {
    console.error("Error starting support query:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getUserSupportQueriesById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const queries = await Support.find({ userId }).sort({ createdAt: -1 });

    if (!queries || queries.length === 0) {
      return res
        .status(200)
        .json({ message: "No support queries found", queries: [] });
    }

    return res.status(200).json(queries);
  } catch (error) {
    console.error("Error fetching support queries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getUserSupportByObjectId = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId) {
      return res.status(400).json({ message: "objectId is required" });
    }

    const query = await Support.findOne({ _id: objectId });
    if (!query) {
      return res.status(200).json({ message: "No support query found" });
    }

    return res.status(200).json(query);
  } catch (error) {
    console.error("Error fetching support queries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getUserSupportQueries = async (req, res) => {
  try {
    const queries = await Support.find().sort({ createdAt: -1 });

    if (!queries || queries.length === 0) {
      return res
        .status(200)
        .json({ message: "No support queries found", queries: [] });
    }

    return res.status(200).json(queries);
  } catch (error) {
    console.error("Error fetching support queries:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getSupportWithMessages = async (req, res) => {
  try {
    const { objectId } = req.params;

    const support = await Support.findById(objectId);
    if (!support) {
      return res.status(404).json({ message: "Support query not found" });
    }

    const messages = await SupportMessage.find({ supportId: objectId }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      support,
      messages,
    });
  } catch (error) {
    console.error("Error fetching support chat:", error);
    return res.status(500).json({
      message: "Server error while fetching support chat",
      error: error.message,
    });
  }
};

export const sendSupportMessage = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { userId, senderType, text } = req.body;

    if (!objectId || !senderType) {
      return res
        .status(400)
        .json({ message: "supportId and senderType are required" });
    }

    let fileNames = [];
    if (req.files && req.files.files) {
      fileNames = req.files.files.map((file) => file.filename);
    }

    const support = await Support.findById(objectId);
    if (!support) {
      return res.status(404).json({ message: "Support query not found" });
    }

    let movedFiles = [];
    if (fileNames.length > 0) {
      movedFiles = await moveSupportFiles(objectId, fileNames);
    }

    const newMessage = await SupportMessage.create({
      supportId: objectId,
      userId,
      senderType,
      text,
      files: movedFiles,
    });

    return res.status(201).json({
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    console.error("Error sending support message:", error);
    return res.status(500).json({
      message: "Internal server error while sending message",
      error: error.message,
    });
  }
};

export const updateSupportStatus = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const support = await Support.findByIdAndUpdate(
      objectId,
      { status },
      { new: true }
    );

    if (!support) {
      return res.status(404).json({ error: "Support query not found" });
    }

    return res.status(200).json({
      message: "Support status updated successfully",
      support,
    });
  } catch (error) {
    console.error("Error updating support status:", error);
    return res.status(500).json({
      error: "Internal server error while updating support status",
    });
  }
};
export const updateMessageIsViewed = async (req, res) => {
  try {
    const { supportId, userId } = req.params;

    const viewedMessages = await SupportMessage.updateMany(
      { supportId, userId: { $ne: userId } },
      { $set: { isView: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as viewed successfully",
      modifiedCount: viewedMessages.modifiedCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const CloseSupportChat = async (req, res) => {
  try {
    const { objectId } = req.params;

    const closedSupport = await Support.findOneAndUpdate(
      { _id: objectId },
      {
        $set: { ended: true, status: "Suspended" },
      }
    );

    if (!closedSupport) {
      return res.status(404).json({ error: "Chat Not Found" });
    }

    return res.status(200).json({ message: "Chat Closed Successfully" });
  } catch (error) {
    console.error("Error updating message view status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUnreadMessages = async (req, res) => {
  try {
    const unreadMessages = await SupportMessage.aggregate([
      {
        $match: { isView: false },
      },
      {
        $group: {
          _id: { supportId: "$supportId", userId: "$userId" },
          unreadCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          supportId: "$_id.supportId",
          userId: "$_id.userId",
          unreadCount: 1,
        },
      },
    ]);

    return res.status(200).json(unreadMessages);
  } catch (error) {
    console.error("Error fetching unread messages:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
