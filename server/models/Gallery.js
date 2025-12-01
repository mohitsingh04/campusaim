import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const GallerySchema = new mongoose.Schema({
  uniqueId: {
    type: Number,
  },
  userId: {
    type: Number,
  },
  propertyId: {
    type: Number,
  },
  title: {
    type: String,
  },
  gallery: {
    type: Array,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Gallery = regularDatabase.model("Gallery", GallerySchema);

export default Gallery;
