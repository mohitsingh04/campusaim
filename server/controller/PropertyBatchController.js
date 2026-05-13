import PropertyBatch from "../models/PropertyBatch.js";
import mongoose from "mongoose";

export const createPropertyBatch = async (req, res) => {
  try {
    const {
      property_id,
      batch_name,
      batch_start_time,
      batch_end_time,
      batch_size,
      price,
      certificate,
      certificate_after,
      demo_class,
      included,
    } = req.body;

    if (!property_id || !batch_name || !batch_start_time || !batch_end_time) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    if (!mongoose.Types.ObjectId.isValid(property_id)) {
      return res.status(400).json({ error: "Invalid property_id" });
    }

    const existingBatch = await PropertyBatch.findOne({
      property_id,
      batch_name: batch_name.trim(),
    });

    if (existingBatch) {
      return res.status(400).json({
        error: "Batch with same name already exists for this property",
      });
    }

    if (batch_size && (isNaN(batch_size) || batch_size <= 0)) {
      return res.status(400).json({ error: "Invalid batch size" });
    }

    const batch = new PropertyBatch({
      property_id,
      batch_name: batch_name.trim(),
      batch_start_time,
      batch_end_time,
      batch_size: batch_size || 0,
      price: price || 0,
      certificate: certificate || false,
      certificate_after: certificate_after || 0,
      demo_class: demo_class || false,
      included: Array.isArray(included) ? included : [],
    });

    await batch.save();

    return res.status(201).json({
      message: "Batch Created Successfully",
      data: batch,
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getBatchByPropertyId = async (req, res) => {
  try {
    const { property_id } = req.params;
    const batch = await PropertyBatch.find({ property_id });
    if (!batch) {
      return res.status(404).json({ error: "Batch Not Found" });
    }
    return res.status(200).json(batch);
  } catch (error) {
    console.error("Error creating batch:", error);
    res.status(400).json({ error: "Internal Server Error" });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;
    const batch = await PropertyBatch.findOneAndDelete({ _id: batch_id });
    if (!batch) {
      return res.status(404).json({ error: "Batch Not Found" });
    }
    return res.status(200).json({ message: "Batch Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting batch:", error);
    res.status(400).json({ error: "Internal Server Error" });
  }
};

export const updatePropertyBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;

    const {
      property_id,
      batch_name,
      batch_start_time,
      batch_end_time,
      batch_size,
      price,
      certificate,
      certificate_after,
      demo_class,
      included,
      status,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(batch_id)) {
      return res.status(400).json({ error: "Invalid batch ID" });
    }

    const existingBatch = await PropertyBatch.findById(batch_id);

    if (!existingBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    if (property_id && !mongoose.Types.ObjectId.isValid(property_id)) {
      return res.status(400).json({ error: "Invalid property_id" });
    }

    if (batch_name) {
      const duplicateBatch = await PropertyBatch.findOne({
        _id: { $ne: batch_id },
        property_id: property_id || existingBatch.property_id,
        batch_name: batch_name.trim(),
      });

      if (duplicateBatch) {
        return res.status(400).json({
          error: "Batch with same name already exists for this property",
        });
      }
    }

    if (batch_size !== undefined) {
      if (isNaN(batch_size) || batch_size <= 0) {
        return res.status(400).json({ error: "Invalid batch size" });
      }
      existingBatch.batch_size = batch_size;
    }

    if (property_id) existingBatch.property_id = property_id;
    if (batch_name) existingBatch.batch_name = batch_name.trim();
    if (batch_start_time) existingBatch.batch_start_time = batch_start_time;
    if (batch_end_time) existingBatch.batch_end_time = batch_end_time;
    if (status !== undefined) existingBatch.status = status;

    if (price !== undefined) existingBatch.price = price;
    if (certificate !== undefined) existingBatch.certificate = certificate;
    if (certificate_after !== undefined)
      existingBatch.certificate_after = certificate_after;
    if (demo_class !== undefined) existingBatch.demo_class = demo_class;

    if (included !== undefined) {
      existingBatch.included = Array.isArray(included) ? included : [];
    }

    await existingBatch.save();

    return res.status(200).json({
      message: "Batch Updated Successfully",
      data: existingBatch,
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllBatches = async (req, res) => {
  try {
    const batches = await PropertyBatch.find();
    return res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
