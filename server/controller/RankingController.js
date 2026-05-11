import mongoose from "mongoose";
import RankingList from "../models/RankingList.js";
import PropertyRanking from "../models/PropertyRanking.js";

export const getOrCreateRankingId = async (rank_name, value_name) => {
  try {
    if (!rank_name) {
      throw new Error("rank_name is required");
    }

    if (!value_name) {
      throw new Error("value_name is required");
    }

    const normalizedName = rank_name.trim().toLowerCase();
    const normalizedValue = value_name.trim().toLowerCase();

    let rank = await RankingList.findOne({ rank_name: normalizedName });

    if (rank) {
      const alreadyExists = rank.rank_value.some(
        (item) => item.value_name === normalizedValue,
      );

      if (!alreadyExists) {
        rank.rank_value.push({ value_name: normalizedValue });

        await rank.save();
      }

      return rank._id;
    }

    // CREATE NEW RANK
    const newRank = await RankingList.create({
      rank_name: normalizedName,
      rank_value: [
        {
          value_name: normalizedValue,
        },
      ],
    });

    return newRank._id;
  } catch (error) {
    console.error("Ranking creation error:", error.message);
    throw error;
  }
};

export const createOrUpdatePropertyRanking = async (req, res) => {
  try {
    const { ranks, property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({
        message: "property_id is required",
      });
    }
    if (!ranks || !Array.isArray(ranks) || ranks.length === 0) {
      return res.status(400).json({
        message: "Ranks array is required",
      });
    }

    const processedRanks = [];

    for (const item of ranks) {
      const { rank_name, value_name } = item;

      if (!rank_name || value_name === undefined) {
        return res.status(400).json({
          message: "rank_name and value are required",
        });
      }

      const rankId = await getOrCreateRankingId(rank_name, value_name);

      processedRanks.push({
        rank_name: rankId,
        value_name: value_name,
      });
    }

    const ranking = await PropertyRanking.findOneAndUpdate(
      { property_id: property_id },
      { $set: { ranks: processedRanks } },
      { new: true, upsert: true },
    );

    return res.status(200).json({
      message: "Property ranking saved successfully",
      data: ranking,
    });
  } catch (error) {
    console.error("Create/Update Property Ranking Error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getPropertyRankAll = async (req, res) => {
  try {
    const rankings = await PropertyRanking.find()
      .populate("ranks.rank_name", "rank_name")
      .lean();

    if (!rankings || rankings.length === 0) {
      return res.status(404).json({
        message: "No rankings found",
      });
    }

    const formattedData = rankings.map((ranking) => {
      return {
        property_id: ranking.property_id,
        ranks: ranking.ranks.map((item) => ({
          rank_name: item?.rank_name?.rank_name || null,
          value_name: item.value_name,
        })),
      };
    });

    return res.status(200).json(formattedData);
  } catch (error) {
    console.error("Get Property Ranking Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getRankByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;

    if (!property_id) {
      return res.status(400).json({
        message: "property_id is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(property_id)) {
      return res.status(400).json({
        message: "Invalid property_id",
      });
    }

    const ranking = await PropertyRanking.findOne({
      property_id: property_id,
    }).populate("ranks.rank_name", "rank_name");

    if (!ranking) {
      return res
        .status(404)
        .json({ message: "Ranking not found for this property" });
    }

    const formattedRanks = ranking.ranks.map((item) => ({
      rank_name: item?.rank_name?.rank_name,
      value_name: item.value_name,
    }));

    return res.status(200).json({
      property_id: ranking.property_id,
      ranks: formattedRanks,
    });
  } catch (error) {
    console.error("Get Property Ranking Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
