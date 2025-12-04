import mongoose from "mongoose";
import { regularDatabase } from "../database/Databases.js";

const TeachersSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  property_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  teacher_name: {
    type: String,
    required: true,
  },
  designation: {
    type: String,
    required: true,
  },
  department: {
    type: String,
  },
  experience: {
    type: String,
    required: true,
  },
  profile: {
    type: Array,
  },
  status: {
    type: String,
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Teachers = regularDatabase.model("Teachers", TeachersSchema);

export default Teachers;
