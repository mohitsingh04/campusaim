import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const GallerySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    title: {
      type: String,
    },
    gallery: {
      type: Array,
    },
  },
  { timestamps: true },
);

const Gallery = regularDatabase.model("Gallery", GallerySchema);

export default Gallery;
