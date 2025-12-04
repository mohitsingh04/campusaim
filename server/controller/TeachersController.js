import mongoose from "mongoose";
import { addPropertyScore } from "../analytic-controller/PropertyScoreController.js";
import { TeacherImageMover } from "../helper/folder-cleaners/PropertyImageMover.js";
import Teachers from "../models/Teachers.js";
import { getUploadedFilePaths } from "../utils/Callback.js";
import { getDataFromToken } from "../utils/getDataFromToken.js";

const toObjectId = (id) => {
  if (!id) return null;
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
};

export const getTeacher = async (req, res) => {
  try {
    const allTeachers = await Teachers.find();
    return res.status(200).json(allTeachers);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const { objectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid teacher id" });
    }
    const teacher = await Teachers.findById(objectId);

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found." });
    }

    return res.status(200).json(teacher);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTeacherByPropertyId = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const propIdObj = toObjectId(propertyId);
    if (!propIdObj) {
      return res.status(400).json({ error: "Invalid property id" });
    }

    const teachers = await Teachers.find({ property_id: propIdObj });
    return res.status(200).json(teachers);
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addTeacher = async (req, res) => {
  try {
    const { teacher_name, designation, experience, property_id, department } = req.body;
    const userId = await getDataFromToken(req);

    const propIdObj = toObjectId(property_id);
    if (!propIdObj) {
      return res.status(400).send({ error: "Invalid property_id" });
    }

    const profileImages = await getUploadedFilePaths(req, "profile");

    if (!teacher_name || !designation || !experience || !property_id) {
      return res.status(400).send({ error: "Missing required fields." });
    }

    const teacherCount = await Teachers.countDocuments({ property_id: propIdObj });

    const newTeacher = new Teachers({
      userId,
      teacher_name,
      profile: profileImages,
      designation,
      department,
      experience,
      property_id: propIdObj,
    });

    await newTeacher.save();

    await TeacherImageMover(req, res, propIdObj.toString());

    if (teacherCount === 0) {
      await addPropertyScore({
        property_score: 10,
        property_id: propIdObj.toString(),
      });
    }

    return res.status(201).send({ message: "Teacher added." });
  } catch (err) {
    return res.status(500).send({ error: "Internal server error!" });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { objectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).send({ error: "Invalid teacher id" });
    }

    const { teacher_name, designation, experience, status, department } = req.body;

    const teacher = await Teachers.findById(objectId);
    if (!teacher) {
      return res.status(404).send({ error: "Teacher not found!" });
    }

    const profile =
      req?.files?.["profile"]?.[0]?.webpFilename ||
      teacher.profile?.[0] ||
      null;

    const originalProfile =
      req?.files?.["profile"]?.[0]?.originalFilename ||
      teacher.profile?.[1] ||
      null;

    const updateData = {
      teacher_name,
      designation,
      department,
      experience,
      status,
      profile: [profile, originalProfile],
    };

    const updated = await Teachers.findByIdAndUpdate(
      objectId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    await TeacherImageMover(req, res, String(teacher.property_id));

    return res.status(200).send({ message: "Teacher updated successfully.", data: updated });
  } catch (err) {
    return res.status(500).send({ error: "Internal server error!" });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { objectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(objectId)) {
      return res.status(400).json({ error: "Invalid teacher id" });
    }

    const deletedTeacher = await Teachers.findByIdAndDelete(objectId);

    if (!deletedTeacher) {
      return res.status(404).json({ error: "Teacher not found." });
    }

    const teacherCount = await Teachers.countDocuments({
      property_id: deletedTeacher.property_id,
    });

    if (teacherCount === 0) {
      await addPropertyScore({
        property_score: -10,
        property_id: String(deletedTeacher.property_id),
      });
    }

    return res.status(200).json({ message: "Teacher deleted." });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
