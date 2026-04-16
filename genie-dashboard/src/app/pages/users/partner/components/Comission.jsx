import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API, CampusaimAPI } from "../../../../services/API";
import Swal from "sweetalert2";

export default function Comission({ userData }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [globalCommission, setGlobalCommission] = useState("");
    const [courseCommission, setCourseCommission] = useState({});

    const [hasCommission, setHasCommission] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // ================= FETCH COURSES =================
    const fetchCourse = async () => {
        try {
            setLoading(true);
            const { data } = await CampusaimAPI.get("/course");
            setCourses(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch course.");
        } finally {
            setLoading(false);
        }
    };

    // ================= FETCH EXISTING =================
    const fetchCommission = async () => {
        try {
            if (!userData?._id) return;

            const { data } = await API.get(`/partner/commission/${userData._id}`);
            const config = data?.data;

            if (!config) {
                setHasCommission(false);
                return;
            }

            setHasCommission(true);

            setGlobalCommission(config.globalAmount || "");

            const map = {};
            (config.courseCommissions || []).forEach((c) => {
                map[c.courseId] = c.amount;
            });

            setCourseCommission(map);

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch commission");
        }
    };

    useEffect(() => {
        fetchCourse();
    }, []);

    useEffect(() => {
        fetchCommission();
    }, [userData?._id]);

    // ================= HANDLE =================
    const handleCourseChange = (courseId, value) => {
        if (value < 0) return;

        setCourseCommission((prev) => ({
            ...prev,
            [courseId]: value
        }));
    };

    // ================= SAVE =================
    const handleSave = async () => {
        try {
            if (!globalCommission) {
                return toast.error("Global commission is required");
            }

            const payload = {
                partnerId: userData?._id,
                globalCommission: Number(globalCommission),
                courseCommission
            };

            await API.post("/partner/commission", payload);

            toast.success("Commission saved");

            setHasCommission(true);
            setIsEditing(false);

        } catch (error) {
            console.error(error);
            toast.error("Failed to save commission");
        }
    };

    // ================= DELETE =================
    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "This will delete commission",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
            });

            if (!result.isConfirmed) return;

            await API.delete(`/partner/commission/${userData._id}`);

            setHasCommission(false);
            setIsEditing(false);
            setGlobalCommission("");
            setCourseCommission({});

            toast.success("Deleted successfully");

        } catch (error) {
            console.error(error);
            toast.error("Delete failed");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="bg-white rounded-xl shadow p-6 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                    Partner Commission
                </h2>

                {!hasCommission ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm"
                    >
                        Add Commission
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm"
                        >
                            Edit
                        </button>

                        <button
                            onClick={handleDelete}
                            className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm"
                        >
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* NO DATA STATE */}
            {!hasCommission && !isEditing && (
                <div className="border rounded-lg p-6 text-center text-gray-500">
                    No Commission Added
                </div>
            )}

            {hasCommission && !isEditing && (
                <div className="border rounded-lg p-5 bg-gray-50 space-y-3">

                    {/* GLOBAL */}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Global Commission:</span>
                        <span className="font-semibold text-green-600">
                            ₹{globalCommission || 0}
                        </span>
                    </div>

                    {/* COURSE WISE */}
                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            Course-wise Overrides
                        </p>

                        {Object.keys(courseCommission).length === 0 ? (
                            <p className="text-xs text-gray-400">
                                No course-specific commission (using global for all)
                            </p>
                        ) : (
                            <div className="space-y-1 max-h-40 overflow-y-auto text-sm">
                                {courses
                                    .filter((c) => courseCommission[c._id])
                                    .map((c) => (
                                        <div key={c._id} className="flex justify-between">
                                            <span>{c.course_name}</span>
                                            <span className="text-green-600 font-medium">
                                                ₹{courseCommission[c._id]}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FORM */}
            {(isEditing) && (
                <>
                    {/* GLOBAL */}
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm font-medium mb-2">
                            Global Commission (₹)
                        </label>

                        <input
                            type="number"
                            value={globalCommission}
                            onChange={(e) => setGlobalCommission(e.target.value)}
                            placeholder="Enter global commission"
                            className="w-full border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                        />

                        <p className="text-xs text-gray-500 mt-1">
                            Used when course-specific commission is not set
                        </p>
                    </div>

                    {/* COURSE */}
                    <div className="space-y-3">
                        <h3 className="text-md font-semibold">
                            Course-wise Commission (Optional)
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            {courses.map((course) => {
                                const value = courseCommission[course._id] ?? "";

                                return (
                                    <div
                                        key={course._id}
                                        className="border rounded-lg p-4 flex flex-col gap-2"
                                    >
                                        <span className="text-sm font-medium">
                                            {course.course_name}
                                        </span>

                                        <input
                                            type="number"
                                            value={value}
                                            placeholder={`Fallback: ₹${globalCommission || 0}`}
                                            onChange={(e) =>
                                                handleCourseChange(course._id, e.target.value)
                                            }
                                            className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500"
                                        />

                                        {!value && (
                                            <span className="text-xs text-gray-400">
                                                Using global commission
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SAVE */}
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
                        >
                            {hasCommission ? "Update Commission" : "Save Commission"}
                        </button>

                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-200 px-5 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}