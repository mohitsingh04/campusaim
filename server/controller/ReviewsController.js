import mongoose from "mongoose";
import Review from "../models/Reviews.js";

export const getReview = async (req, res) => {
  try {
    const reviews = await Review.find();

    if (reviews.length === 0) {
      return res.status(404).json({ error: "No reviews found!" });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getReviewById = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid Review ID!" });
    }

    const review = await Review.findById(objectId);

    if (!review) {
      return res.status(404).json({ error: "Review not found!" });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getReviewByPropertyId = async (req, res) => {
  try {
    let { property_id } = req.params;

    if (!property_id) {
      return res.status(400).json({ error: "Property ID is required!" });
    }

    const reviews = await Review.find({ property_id });

    if (reviews.length === 0) {
      return res
        .status(404)
        .json({ error: "No reviews found for this property!" });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addReview = async (req, res) => {
  try {
    const { userId, property_id, name, email, phone_number, rating, review } =
      req.body;

    if (!property_id || !name || !rating || !review) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    if (phone_number) {
      const existPhoneReview = await Review.findOne({
        phone_number: `+${phone_number}`,
        property_id,
      });
      if (existPhoneReview) {
        return res
          .status(400)
          .json({ error: "Review already exists for this phone number!" });
      }
    }

    if (email) {
      const existEmailReview = await Review.findOne({
        email,
        property_id,
      });
      if (existEmailReview) {
        return res
          .status(400)
          .json({ error: "Review already exists for this email!" });
      }
    }

    const newReview = new Review({
      property_id,
      name,
      email,
      phone_number: phone_number ? `+${phone_number}` : undefined,
      rating,
      review,
      ...(userId && { userId }),
    });

    await newReview.save();
    return res.status(201).json({ message: "Review added successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { objectId } = req.params;
    const { name, phone_number, email, rating, review: reviewText } = req.body;

    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({
        error: "Valid review ID (objectId) is required.",
      });
    }

    if (!name && !phone_number && !email && !rating && !reviewText) {
      return res.status(400).json({
        error: "At least one field to update is required.",
      });
    }

    const currentReview = await Review.findById(objectId);
    if (!currentReview) {
      return res.status(404).json({ error: "Review not found." });
    }

    const updateFields = {};

    if (name) updateFields.name = name;
    if (rating !== undefined) updateFields.rating = rating;
    if (reviewText) updateFields.review = reviewText;

    // Phone handling and uniqueness check
    if (phone_number) {
      const trimmed = String(phone_number).trim();
      const formattedPhone = trimmed.startsWith("+") ? trimmed : `+${trimmed}`;

      const phoneExists = await Review.findOne({
        phone_number: formattedPhone,
        _id: { $ne: currentReview._id },
        property_id: currentReview.property_id,
      });

      if (phoneExists) {
        return res.status(400).json({ error: "Phone number already in use." });
      }

      updateFields.phone_number = formattedPhone;
    }

    // Email uniqueness check
    if (email) {
      const trimmedEmail = String(email).trim().toLowerCase();

      const emailExists = await Review.findOne({
        email: trimmedEmail,
        _id: { $ne: currentReview._id },
        property_id: currentReview.property_id,
      });

      if (emailExists) {
        return res.status(400).json({ error: "Email already in use." });
      }

      updateFields.email = trimmedEmail;
    }

    const updatedReview = await Review.findByIdAndUpdate(
      objectId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ error: "Review not found." });
    }

    return res.status(200).json({
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (err) {
    console.error("updateReview Error:", err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { objectId } = req.params;

    if (!objectId || !mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid review ID." });
    }

    const deletedReview = await Review.findByIdAndDelete(objectId);

    if (!deletedReview) {
      return res.status(404).json({ error: "Review not found." });
    }

    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (err) {
    console.error("deleteReview Error:", err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};
