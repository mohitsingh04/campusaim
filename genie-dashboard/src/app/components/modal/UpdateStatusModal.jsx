import React, { useState } from "react";
import { API } from "../../services/API";
import { X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";

const validationSchema = Yup.object({
    status: Yup.string().required("Status required"),

    applicationDoneBy: Yup.string().when("status", {
        is: "applications_done",
        then: (s) => s.required("Required"),
    }),

    counselorId: Yup.string().when("status", {
        is: "converted",
        then: (s) => s.required("Required"),
    }),

    courseId: Yup.string().when("status", {
        is: (val) => val === "applications_done" || val === "converted",
        then: (s) => s.required("Required"),
    }),

    collegeId: Yup.string().when("status", {
        is: "converted",
        then: (s) => s.required("Required"),
    }),
});

export default function UpdateStatusModal({
    isOpen,
    onClose,
    lead,
    onSuccess,
    users = [],
    courses = [],
    hasConversation
}) {
    const [loading, setLoading] = useState(false);

    // ⚠️ TEMP (replace with DB IDs later)
    const collegeOptions = [
        { value: "1", label: "Delhi University" },
        { value: "2", label: "Amity University" },
        { value: "3", label: "Lovely Professional University" },
        { value: "4", label: "Chandigarh University" },
        { value: "5", label: "Graphic Era University" },
    ];

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            status: lead?.status || "",
            applicationDoneBy: lead?.applicationDoneBy?._id || "",
            counselorId: lead?.admission?.counselorId || "",
            courseId: lead?.admission?.courseId || "",
            collegeId: lead?.admission?.collegeId || "",
        },
        validationSchema,

        onSubmit: async (values) => {
            try {
                setLoading(true);

                const payload = { status: values.status };

                // ✅ APPLICATION
                if (values.status === "applications_done") {
                    payload.applicationDoneBy = values.applicationDoneBy;
                    payload.courseId = values.courseId;
                }

                // ✅ ADMISSION (THIS WAS YOUR ISSUE)
                if (values.status === "converted") {
                    payload.admission = {
                        userId: values.counselorId,
                        courseId: values.courseId,
                        collegeId: values.collegeId,
                    };
                }

                await API.put(`/leads/update-status/${lead._id}`, payload);

                toast.success("Status updated");
                onSuccess?.();
                onClose();
            } catch (err) {
                toast.error(err?.response?.data?.error || "Error");
            } finally {
                setLoading(false);
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">

                {/* HEADER */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Update Status</h2>
                    <button
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
                <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    className="w-full border p-2 rounded"
                >
                    <option value="">Select Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="applications_done">Application Done</option>
                    <option value="converted">Admission Done</option>
                    <option value="lost">Lost</option>
                </select>

                {/* APPLICATION */}
                {formik.values.status === "applications_done" && (
                    <>
                        <select
                            name="applicationDoneBy"
                            value={formik.values.applicationDoneBy}
                            onChange={formik.handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Select User</option>
                            {users.map((u) => (
                                <option key={u.value} value={u.value}>
                                    {u.label}
                                </option>
                            ))}
                        </select>

                        <select
                            name="courseId"
                            value={formik.values.courseId}
                            onChange={formik.handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Select Course</option>
                            {courses.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {/* ADMISSION */}
                {formik.values.status === "converted" && (
                    <>
                        <select
                            name="counselorId"
                            value={formik.values.counselorId}
                            onChange={formik.handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Select User</option>
                            {users.map((u) => (
                                <option key={u.value} value={u.value}>
                                    {u.label}
                                </option>
                            ))}
                        </select>

                        <select
                            name="courseId"
                            value={formik.values.courseId}
                            onChange={formik.handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Select Course</option>
                            {courses.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>

                        <select
                            name="collegeId"
                            value={formik.values.collegeId}
                            onChange={formik.handleChange}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Select College</option>
                            {collegeOptions.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </>
                )}

                {/* ACTIONS */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={formik.handleSubmit}
                        disabled={loading || !hasConversation}
                        className={`px-4 py-2 rounded text-white ${!hasConversation
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