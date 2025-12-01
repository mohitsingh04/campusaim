import Coupon from "../models/Coupon.js";

export const CreateCoupon = async (req, res) => {
  try {
    const {
      property_id,
      userId,
      coupon_code,
      start_from,
      valid_upto,
      discount,
      description,
    } = req.body;

    if (
      !property_id ||
      !userId ||
      !coupon_code ||
      !start_from ||
      !valid_upto ||
      !discount
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingCoupon = await Coupon.findOne({ coupon_code: coupon_code });
    if (existingCoupon) {
      return res.status(409).json({ error: "Coupon code already exists" });
    }

    const couponCount = await Coupon.countDocuments({ property_id });
    if (couponCount >= 3) {
      return res
        .status(400)
        .json({ error: "Only 3 coupons allowed per property" });
    }

    const lastCoupon = await Coupon.findOne().sort({ uniqueId: -1 });
    let newUniqueId = "1";
    if (lastCoupon && !isNaN(lastCoupon.uniqueId)) {
      newUniqueId = (parseInt(lastCoupon.uniqueId) + 1).toString();
    }

    const newCoupon = new Coupon({
      uniqueId: newUniqueId,
      userId,
      property_id,
      coupon_code: coupon_code,
      start_from: new Date(start_from),
      valid_upto: new Date(valid_upto),
      discount: Number(discount),
      description,
    });

    const savedCoupon = await newCoupon.save();
    return res.status(201).json(savedCoupon);
  } catch (error) {
    console.error("CreateCoupon error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCouponByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;

    const coupons = await Coupon.find({ property_id: property_id });
    if (!coupons) {
      return res.status(404).json({ error: "Coupons Not Found" });
    }

    return res.status(200).json(coupons);
  } catch (error) {
    console.log(error);
  }
};

export const getAllCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    if (!coupons) {
      return res.status(404).json({ error: "Coupons Not Found" });
    }

    return res.status(200).json(coupons);
  } catch (error) {
    console.log(error);
  }
};

export const DeleteCoupon = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const coupon = await Coupon.findOneAndDelete({ uniqueId: uniqueId });
    if (!coupon) {
      return res.status(404).json({ error: "Coupon Not Found" });
    }
    return res.status(200).json({ message: "Coupon Deleted Successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const UpdateCoupon = async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const {
      property_id,
      userId,
      coupon_code,
      start_from,
      valid_upto,
      discount,
      description,
    } = req.body;

    if (
      !property_id ||
      !userId ||
      !coupon_code ||
      !start_from ||
      !valid_upto ||
      !discount
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const coupon = await Coupon.findOne({ uniqueId });
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    const existingCoupon = await Coupon.findOne({
      coupon_code,
      uniqueId: { $ne: uniqueId },
    });

    if (existingCoupon) {
      return res.status(409).json({ error: "Coupon code already in use" });
    }

    const otherCouponsForProperty = await Coupon.find({
      property_id,
      uniqueId: { $ne: uniqueId },
    });

    if (otherCouponsForProperty.length >= 3) {
      return res
        .status(400)
        .json({ error: "Only 3 coupons allowed per property" });
    }

    coupon.property_id = property_id;
    coupon.userId = userId;
    coupon.coupon_code = coupon_code;
    coupon.start_from = new Date(start_from);
    coupon.valid_upto = new Date(valid_upto);
    coupon.discount = Number(discount);
    coupon.description = description;

    const updatedCoupon = await coupon.save();
    return res.status(200).json(updatedCoupon);
  } catch (error) {
    console.error("UpdateCoupon error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
