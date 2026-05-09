import React, { useEffect, useState } from "react";
import { API, CampusaimAPI } from "../../services/API";
import { X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

// const validationSchema = Yup.object({
//     status: Yup.string().required("Status required"),

//     applicationDoneBy: Yup.string().when("status", {
//         is: "applications_done",
//         then: (s) => s.required("Required"),
//     }),

//     counselorId: Yup.string().when("status", {
//         is: "converted",
//         then: (s) => s.required("Required"),
//     }),

//     courseId: Yup.string().when("status", {
//         is: (val) => val === "applications_done" || val === "converted",
//         then: (s) => s.required("Required"),
//     }),

//     propertyId: Yup.string().when("status", {
//         is: "converted",
//         then: (s) => s.required("Required"),
//     }),

//     class: Yup.string().when("categoryType", {
//         is: "School",
//         then: (s) => s.required("Required"),
//     }),

//     coachingType: Yup.string().when("categoryType", {
//         is: "Coaching",
//         then: (s) => s.required("Required"),
//     }),

//     customCoaching: Yup.string().when("coachingType", {
//         is: "Other",
//         then: (s) => s.required("Required"),
//     }),
// });

const SCHOOL_CLASSES = ["Nursery", "KG", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th",];

const COACHING_OPTIONS = ["NDA", "CDS", "Sainik School", "RMS", "RIMC", "Other",];

const propertyPlaceholderMap = {
    School: "Select School",
    College: "Select College",
    University: "Select University",
    Coaching: "Select Coaching",
};

export default function UpdateStatusModal({
    authUser,
    isOpen,
    onClose,
    lead,
    onSuccess,
    users = [],
    hasConversation
}) {
    const [category, setCategory] = useState([]);
    const [property, setProperty] = useState([]);
    const [course, setCourse] = useState([]);
    const [propertyCourse, setPropertyCourse] = useState([]);
    const [loading, setLoading] = useState(false);

    const categoryId = lead?.category;
    const myCategory = category.find((a) => String(a._id) === String(categoryId));

    const categoryKeyMap = {
        School: "school",
        College: "college_university",
        University: "college_university",
        Coaching: "coaching"
    };

    const categoryName = myCategory?.category_name;
    const categoryKey = categoryKeyMap[categoryName] || "college_university";

    const propertyOptions = property.map((item) => ({
        value: item._id,
        label:
            item?.[categoryKey]?.property_name ||
            item?.property_name ||
            "Unnamed Property",
    }));

    const propertyPlaceholder = propertyPlaceholderMap[categoryName] || "Select Property";

    useEffect(() => {
        const fetchPropertyCourse = async () => {
            try {
                const res = await CampusaimAPI.get("/property-course");
                const course = res?.data;
                setPropertyCourse(course);
            } catch (error) {
                toast.error("Internal server error.");
                console.error(error)
            }
        };
        fetchPropertyCourse();
    }, []);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await CampusaimAPI.get("/course");
                const course = res?.data;
                setCourse(course);
            } catch (error) {
                toast.error("Internal server error.");
                console.error(error)
            }
        };

        fetchCourses();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await CampusaimAPI.get("/category");
                const filteredCat = res.data.filter((a) => a.parent_category === "Academic Type");
                setCategory(filteredCat);
            } catch (error) {
                toast.error("Internal server error.");
                console.error(error)
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await CampusaimAPI.get("/property");

                const filteredProperty = (res?.data || []).filter(
                    (item) =>
                        String(item?.academic_type) === String(categoryId)
                );

                setProperty(filteredProperty);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load properties.");
            }
        };

        if (categoryId) {
            fetchProperties();
        }
    }, [categoryId]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            status: lead?.status || "",
            applicationDoneBy:
                lead?.applicationDoneBy?._id ||
                lead?.lastConversationBy ||
                "",
            counselorId:
                lead?.admission?.userId ||
                lead?.lastConversationBy ||
                "",
            courseId: lead?.admission?.courseId || "",
            propertyId: lead?.admission?.propertyId || "",

            categoryType: categoryName || "",
            class: "",
            coachingType: "",
            customCoaching: "",
        },
        // validationSchema,

        onSubmit: async (values) => {
            try {
                setLoading(true);

                const payload = {
                    status: values.status,
                };

                // COMMON DATA
                const commonData = {
                    propertyId: values.propertyId || null,
                };

                // SCHOOL
                if (categoryKey === "school") {
                    commonData.school = values.class;
                }

                // COACHING
                if (categoryKey === "coaching") {
                    commonData.coaching =
                        values.coachingType === "Other"
                            ? values.customCoaching
                            : values.coachingType;
                }

                // COLLEGE / UNIVERSITY
                if (categoryKey === "college_university") {
                    commonData.courseId = values.courseId;
                }

                // APPLICATION
                if (values.status === "applications_done") {
                    payload.application = {
                        ...commonData,
                        applicationBy: values.applicationDoneBy,
                    };
                }

                // ADMISSION
                if (values.status === "converted") {
                    payload.admission = {
                        ...commonData,
                        admissionBy: values.counselorId,
                    };
                }

                await API.put(`/leads/update-status/${lead._id}`, payload);
                toast.success("Status updated");
                onSuccess?.();
                onClose();
            } catch (err) {
                toast.error(err?.response?.data?.error || "Internal server error.");
            } finally {
                setLoading(false);
            }
        },
    });

    const getFieldError = (field) => formik.touched[field] && formik.errors[field];

    const selectedProperty = formik.values.propertyId;

    const mappedCourses = propertyCourse.filter(
        (pc) => String(pc.property_id) === String(selectedProperty)
    );

    const courseIds = mappedCourses.map((pc) => String(pc.course_id));

    const filteredCourse = course.filter((c) =>
        courseIds.includes(String(c._id))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Update Status</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1 rounded hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* WARNING */}
                {!hasConversation && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded">
                        You must start at least one conversation before updating lead status.
                    </div>
                )}

                {/* STATUS */}
                <div className="space-y-1">
                    <select
                        name="status"
                        value={formik.values.status}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`w-full border p-2 rounded ${getFieldError("status")
                            ? "border-red-500"
                            : "border-gray-300"
                            }`}
                    >
                        <option value="">Select Status</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="applications_done">Application Done</option>
                        <option value="converted">Admission Done</option>
                        <option value="lost">Lost</option>
                    </select>
                    {getFieldError("status") && (
                        <p className="text-red-500 text-sm">{formik.errors.status}</p>
                    )}
                </div>

                {/* APPLICATION */}
                {formik.values.status === "applications_done" && (
                    <>
                        {/* Select User */}
                        <div className="space-y-1">
                            <select
                                name="applicationDoneBy"
                                value={formik.values.applicationDoneBy}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full border p-2 rounded ${getFieldError("applicationDoneBy")
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select User</option>
                                {users.map((u) => (
                                    <option key={u.value} value={u.value}>
                                        {u.label}
                                    </option>
                                ))}
                            </select>
                            {getFieldError("applicationDoneBy") && (
                                <p className="text-red-500 text-sm">{formik.errors.applicationDoneBy}</p>
                            )}
                        </div>

                        {/* Select College/University/School/Coaching */}
                        <div className="space-y-1">
                            <select
                                name="propertyId"
                                value={formik.values.propertyId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full border p-2 rounded ${getFieldError("propertyId")
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            >
                                <option value="">{propertyPlaceholder}</option>

                                {propertyOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            {getFieldError("propertyId") && (
                                <p className="text-red-500 text-sm">{formik.errors.propertyId}</p>
                            )}
                        </div>

                        {/* Select Class */}
                        {categoryName === "School" && (
                            <div className="space-y-1">
                                <select
                                    name="class"
                                    value={formik.values.class}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full border p-2 rounded ${getFieldError("class")
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select Class</option>

                                    {SCHOOL_CLASSES.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>

                                {getFieldError("class") && (
                                    <p className="text-red-500 text-sm">
                                        {formik.errors.class}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Select Coaching */}
                        {categoryName === "Coaching" && (
                            <>
                                <div className="space-y-1">
                                    <select
                                        name="coachingType"
                                        value={formik.values.coachingType}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full border p-2 rounded ${getFieldError("coachingType")
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Select Coaching</option>

                                        {COACHING_OPTIONS.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>

                                    {getFieldError("coachingType") && (
                                        <p className="text-red-500 text-sm">
                                            {formik.errors.coachingType}
                                        </p>
                                    )}
                                </div>

                                {formik.values.coachingType === "Other" && (
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            name="customCoaching"
                                            placeholder="Enter Coaching Name"
                                            value={formik.values.customCoaching}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full border p-2 rounded ${getFieldError("customCoaching")
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                        />

                                        {getFieldError("customCoaching") && (
                                            <p className="text-red-500 text-sm">
                                                {formik.errors.customCoaching}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Select Course */}
                        {["College", "University"].includes(categoryName) && (
                            <div className="space-y-1">
                                <select
                                    name="courseId"
                                    value={formik.values.courseId}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full border p-2 rounded ${getFieldError("courseId")
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select Course</option>
                                    {filteredCourse.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.course_name}
                                        </option>
                                    ))}
                                </select>
                                {getFieldError("courseId") && (
                                    <p className="text-red-500 text-sm">{formik.errors.courseId}</p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ADMISSION */}
                {formik.values.status === "converted" && (
                    <>
                        {/* Select User */}
                        <div className="space-y-1">
                            <select
                                name="counselorId"
                                value={formik.values.counselorId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`w-full border p-2 rounded ${getFieldError("counselorId")
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            >
                                <option value="">Select User</option>
                                {users.map((u) => (
                                    <option key={u.value} value={u.value}>
                                        {u.label}
                                    </option>
                                ))}
                            </select>
                            {getFieldError("counselorId") && (
                                <p className="text-red-500 text-sm">{formik.errors.counselorId}</p>
                            )}
                        </div>

                        {/* Select College/University/School/Coaching */}
                        <div className="space-y-1">
                            <select
                                name="propertyId"
                                value={formik.values.propertyId}
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    formik.setFieldValue("courseId", "");
                                }}
                                onBlur={formik.handleBlur}
                                className={`w-full border p-2 rounded ${getFieldError("propertyId")
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            >
                                <option value="">{propertyPlaceholder}</option>

                                {propertyOptions.map((item) => (
                                    <option key={item.value} value={item.value}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                            {getFieldError("propertyId") && (
                                <p className="text-red-500 text-sm">{formik.errors.propertyId}</p>
                            )}
                        </div>

                        {/* Select Class */}
                        {categoryName === "School" && (
                            <div className="space-y-1">
                                <select
                                    name="class"
                                    value={formik.values.class}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full border p-2 rounded ${getFieldError("class")
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select Class</option>

                                    {SCHOOL_CLASSES.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>

                                {getFieldError("class") && (
                                    <p className="text-red-500 text-sm">
                                        {formik.errors.class}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Select Coaching */}
                        {categoryName === "Coaching" && (
                            <>
                                <div className="space-y-1">
                                    <select
                                        name="coachingType"
                                        value={formik.values.coachingType}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full border p-2 rounded ${getFieldError("coachingType")
                                            ? "border-red-500"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        <option value="">Select Coaching</option>

                                        {COACHING_OPTIONS.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>

                                    {getFieldError("coachingType") && (
                                        <p className="text-red-500 text-sm">
                                            {formik.errors.coachingType}
                                        </p>
                                    )}
                                </div>

                                {formik.values.coachingType === "Other" && (
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            name="customCoaching"
                                            placeholder="Enter Coaching Name"
                                            value={formik.values.customCoaching}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full border p-2 rounded ${getFieldError("customCoaching")
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                        />

                                        {getFieldError("customCoaching") && (
                                            <p className="text-red-500 text-sm">
                                                {formik.errors.customCoaching}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Select Course */}
                        {["College", "University"].includes(categoryName) && (
                            <div className="space-y-1">
                                <select
                                    name="courseId"
                                    value={formik.values.courseId}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full border p-2 rounded ${getFieldError("courseId")
                                        ? "border-red-500"
                                        : "border-gray-300"
                                        }`}
                                >
                                    <option value="">Select Course</option>
                                    {filteredCourse.map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.course_name}
                                        </option>
                                    ))}
                                </select>
                                {getFieldError("courseId") && (
                                    <p className="text-red-500 text-sm">{formik.errors.courseId}</p>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ACTIONS */}
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        onClick={formik.handleSubmit}
                        disabled={loading || !hasConversation}
                        className={`px-4 py-2 rounded text-white ${loading || !hasConversation
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                            }`}
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
}