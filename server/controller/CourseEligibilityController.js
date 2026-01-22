import CourseEligibility from "../models/CourseEligibility.js";

export const getAllCourseEligibility = async (req, res) => {
    try {
        const courseEligibility = await CourseEligibility.find();

        if (!courseEligibility) {
            return res.status(404).json({ error: "Course Eligibility Not Found" });
        }

        return res.status(200).json(courseEligibility);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getCourseEligibilityById = async (req, res) => {
    try {
        const { objectId } = req.params;
        const courseEligibility = await CourseEligibility.findById(objectId);

        if (!courseEligibility) {
            return res.status(404).json({ error: "Course Eligibility Not Found" });
        }

        return res.status(200).json(courseEligibility);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const CreateCourseEligibility = async (req, res) => {
    try {
        const { course_eligibility } = req.body;

        const existingCourseEligibility = await CourseEligibility.findOne({ course_eligibility });

        if (existingCourseEligibility) {
            return res.status(400).json({ error: "Already exists." });
        }

        const lastDoc = await CourseEligibility.findOne().sort({ uniqueId: -1 });
        const uniqueId = lastDoc ? lastDoc?.uniqueId + 1 : 1;

        const newCourseEligibility = new CourseEligibility({
            uniqueId,
            course_eligibility,
        });

        await newCourseEligibility.save();

        return res
            .status(201)
            .json({ message: "Course Eligibility created successfully." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateCourseEligibility = async (req, res) => {
    try {
        const { objectId } = req.params;
        const { course_eligibility } = req.body;

        const courseEligibility = await CourseEligibility.findById(objectId);

        if (!courseEligibility) {
            return res.status(404).json({ error: "Course Eligibility Not Found" });
        }

        courseEligibility.course_eligibility =
            course_eligibility ?? courseEligibility.course_eligibility;

        await courseEligibility.save();

        return res.status(200).json({
            message: "Course Eligibility Updated Successfully",
            data: courseEligibility,
        });
    } catch (error) {
        console.error("Update Course Eligibility Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteCourseEligibility = async (req, res) => {
    try {
        const { objectId } = req.params;

        const courseEligibility = await CourseEligibility.findById(objectId);

        if (!courseEligibility) {
            return res.status(404).json({ error: "CourseEligibility Not Found" });
        }

        await CourseEligibility.findByIdAndDelete(objectId);

        return res.status(200).json({
            message: "CourseEligibility deleted successfully",
        });
    } catch (error) {
        console.error("Delete CourseEligibility Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};