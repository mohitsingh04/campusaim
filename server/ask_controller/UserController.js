import Follow from "../ask_model/Follow.js";
import Notification from "../ask_model/Notification.js";
import Reputation from "../ask_model/Reputation.js";
import RegularUser from "../profile-model/RegularUser.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";
import jwt from "jsonwebtoken";
import ProfileLocation from "../profile-model/ProfileLocation.js";

export const token = async (req, res) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_VALUE);
    const user = await RegularUser.findById(decoded.id).select("-password").lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const myProfile = async (req, res) => {
  try {
    const userId = await getDataFromToken(req);
    const user = await RegularUser.findOne({ _id: userId }).select("-password").lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User Found", data: user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const fetchAllUsers = async (req, res) => {
  try {
    const users = await RegularUser.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      error: "Server error, unable to fetch users",
    });
  }
};

export const fetchSingleUser = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await RegularUser.findOne({ username }).select("-password").lean();
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    // Fetch the user's location(s)
    const location = await ProfileLocation.findOne({ userId: user.uniqueId }).select("city state country").lean();

    // Attach location to user object
    user.location = location || null;

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error fetchSingleUser:", error);
    return res.status(500).json({
      success: false,
      error: "Server error, unable to fetch user.",
    });
  }
};

// 👉 Follow a user
export const followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = await getDataFromToken(req);

    if (targetUserId === String(currentUserId)) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Check if target user exists
    const targetUser = await RegularUser.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following
    const alreadyFollowing = await Follow.findOne({
      follower: currentUserId,
      followingType: "User",
      following: targetUserId,
    });

    if (alreadyFollowing) {
      return res.status(400).json({ error: "Already following" });
    }

    // Create follow document
    await Follow.create({
      follower: currentUserId,
      followingType: "User",
      following: targetUserId,
    });

    // Create notification for the target user
    await Notification.create({
      recipient: targetUserId,
      sender: currentUserId,
      type: "USER_FOLLOWED",
      question: undefined, // Not needed if you make it optional
    });

    return res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Unfollow a user
export const unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = await getDataFromToken(req);

    // Check if target user exists
    const targetUser = await RegularUser.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete follow document
    const result = await Follow.findOneAndDelete({
      follower: currentUserId,
      followingType: "User",
      following: targetUserId,
    });

    if (!result) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👉 Get followers
export const getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Find all follow docs where this user is being followed
    const follows = await Follow.find({
      followingType: "User",
      following: userId,
    }).lean();

    // 2. Extract follower IDs
    const followerIds = follows.map(f => f.follower);

    // 3. Fetch user info for all follower IDs
    const users = await RegularUser.find(
      { _id: { $in: followerIds } },
      "name username avatar"
    ).lean();

    // 4. Return the user info
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// 👉 Get following
export const getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Find all follow docs where this user is the follower and followingType is User
    const follows = await Follow.find({
      follower: userId,
      followingType: "User",
    }).lean();

    // 2. Extract following user IDs
    const followingIds = follows.map(f => f.following);

    // 3. Fetch user info for all following IDs
    const users = await RegularUser.find(
      { _id: { $in: followingIds } },
      "name username avatar"
    ).lean();

    // 4. Return the user info
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Top Users
export const fetchTopUsers = async (req, res) => {
  try {
    // Find top 5 reputations, highest score first
    const topReputations = await Reputation.find()
      .sort({ score: -1, updatedAt: -1 })
      .limit(5);

    // Manually fetch user info for each reputation
    const topUsers = await Promise.all(
      topReputations.map(async (r) => {
        const user = await RegularUser.findById(r.author).select("name username avatar");
        if (!user) return null; // skip if user not found
        return {
          user,
          score: r.score,
        };
      })
    );

    // Filter out any nulls (in case a user was deleted)
    const filteredTopUsers = topUsers.filter(Boolean);

    return res.status(200).json(filteredTopUsers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};