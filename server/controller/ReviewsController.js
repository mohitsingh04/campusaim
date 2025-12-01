import Review from "../models/Reviews.js";

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

    const lastReview = await Review.findOne().sort({ _id: -1 });
    const uniqueId = lastReview ? lastReview.uniqueId + 1 : 1;

    const newReview = new Review({
      uniqueId,
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
    const { uniqueId } = req.params;

    if (!uniqueId) {
      return res.status(400).json({ error: "Unique ID is required!" });
    }

    const review = await Review.findOne({ uniqueId });

    if (!review) {
      return res.status(404).json({ error: "Review not found!" });
    }

    return res.status(200).json(review);
  } catch (error) {
    console.log(error);
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

export const updateReview = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const { name, phone_number, email, rating, review } = req.body;

    if (!uniqueId || (!name && !phone_number && !email && !rating && !review)) {
      return res.status(400).json({
        error: "Unique ID and at least one field to update are required.",
      });
    }

    const currentReview = await Review.findOne({ uniqueId });
    if (!currentReview) {
      return res.status(404).json({ error: "Review not found." });
    }

    const updateFields = {};

    if (name) updateFields.name = name;
    if (rating) updateFields.rating = rating;
    if (review) updateFields.review = review;

    if (phone_number) {
      const formattedPhone = phone_number.startsWith("+")
        ? phone_number
        : `+${phone_number}`;

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

    if (email) {
      const emailExists = await Review.findOne({
        email,
        _id: { $ne: currentReview._id },
        property_id: currentReview.property_id,
      });

      if (emailExists) {
        return res.status(400).json({ error: "Email already in use." });
      }

      updateFields.email = email;
    }

    const updatedReview = await Review.findOneAndUpdate(
      { uniqueId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { uniqueId } = req.params;

    const deletedReview = await Review.findOneAndDelete({ uniqueId });

    if (!deletedReview) {
      return res.status(404).json({ error: "Review not found." });
    }

    return res.status(200).json({ message: "Review deleted successfully." });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};
