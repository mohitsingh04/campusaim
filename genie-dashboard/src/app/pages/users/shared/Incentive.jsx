import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API, CampusaimAPI } from "../../../services/API";
import Swal from "sweetalert2";

export default function Incentive({ userData }) {
    const userId = userData?._id;

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const [globalAmount, setGlobalAmount] = useState("");
    const [courseIncentives, setCourseIncentives] = useState({});

    const [hasIncentive, setHasIncentive] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [incentiveId, setIncentiveId] = useState(null);

    // ================= FETCH COURSES =================
    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await CampusaimAPI.get("/course");
            setCourses(data || []);
        } catch (err) {
            toast.error("Failed to fetch courses");
        } finally {
            setLoading(false);
        }
    };

    // ================= FETCH EXISTING =================
    const fetchIncentive = async () => {
        try {
            if (!userId) return;

            const { data } = await API.get(`/incentives/${userId}`);
            const config = data?.data;

            if (!config) {
                setHasIncentive(false);
                return;
            }

            setHasIncentive(true);

            setGlobalAmount(config.globalAmount || "");
            setIncentiveId(config._id);
            const map = {};
            (config.courseIncentives || []).forEach((c) => {
                map[c.courseId] = c.amount;
            });

            setCourseIncentives(map);

        } catch (err) {
            toast.error("Failed to fetch incentive");
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        fetchIncentive();
    }, [userId]);

    // ================= HANDLE =================
    const handleCourseChange = (courseId, value) => {
        if (value < 0) return;

        setCourseIncentives((prev) => ({
            ...prev,
            [courseId]: value
        }));
    };

    // ================= SAVE =================
    const handleSave = async () => {
        try {
            const hasGlobal = globalAmount !== "";
            const hasCourse = Object.values(courseIncentives).some(v => Number(v) >= 0);

            if (!hasGlobal && !hasCourse) {
                return toast.error("Add global or course incentive");
            }

            const payload = {
                userId,
                globalAmount: hasGlobal ? Number(globalAmount) : null,
                courseIncentives: Object.entries(courseIncentives)
                    .filter(([_, v]) => Number(v) >= 0)
                    .map(([courseId, amount]) => ({
                        courseId,
                        amount: Number(amount)
                    }))
            };

            if (hasIncentive && incentiveId) {
                await API.put(`/incentives/${incentiveId}`, payload);
                toast.success("Incentive updated");
            } else {
                await API.post(`/incentives`, payload);
                toast.success("Incentive created");
            }

            setIsEditing(false);
            setHasIncentive(true);

        } catch (err) {
            console.error(err);
            toast.error("Save failed");
        }
    };

    // ================= DELETE =================
    const handleDelete = async () => {
        try {
            const result = await Swal.fire({
                title: "Are you sure?",
                text: "This will delete incentive",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, delete",
            });

            if (!result.isConfirmed) return;

            await API.delete(`/incentives/${userId}`);

            setHasIncentive(false);
            setIsEditing(false);
            setGlobalAmount("");
            setCourseIncentives({});

            toast.success("Deleted successfully");

        } catch (err) {
            toast.error("Delete failed");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="bg-white rounded-xl shadow p-6 space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                    {userData?.role === "teamleader"
                        ? "Team Leader Incentive"
                        : "Counselor Incentive"}
                </h2>

                {!hasIncentive ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm"
                    >
                        Add Incentive
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

            {/* EMPTY */}
            {!hasIncentive && !isEditing && (
                <div className="border rounded-lg p-6 text-center text-gray-500">
                    No Incentive Added
                </div>
            )}

            {/* SUMMARY */}
            {hasIncentive && !isEditing && (
                <div className="border rounded-lg p-5 bg-gray-50 space-y-3">

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Global Incentive:</span>
                        <span className="font-semibold text-green-600">
                            ₹{globalAmount || 0}
                        </span>
                    </div>

                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            Course-wise Overrides
                        </p>

                        {Object.keys(courseIncentives).length === 0 ? (
                            <p className="text-xs text-gray-400">
                                Using global for all courses
                            </p>
                        ) : (
                            <div className="space-y-1 text-sm">
                                {courses
                                    .filter((c) => courseIncentives[c._id])
                                    .map((c) => (
                                        <div key={c._id} className="flex justify-between">
                                            <span>{c.course_name}</span>
                                            <span className="text-green-600">
                                                ₹{courseIncentives[c._id]}
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* FORM */}
            {isEditing && (
                <>
                    <div className="border p-4 rounded-lg bg-gray-50">
                        <label className="block text-sm mb-2">
                            Global Incentive (₹)
                        </label>

                        <input
                            type="number"
                            value={globalAmount}
                            placeholder="Enter global incetive"
                            onChange={(e) => setGlobalAmount(e.target.value)}
                            className="w-full border px-3 py-2 rounded-md"
                        />

                        <p className="text-xs text-gray-500 mt-1">
                            Used when course-specific incetive is not set
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {courses.map((c) => (
                            <div key={c._id} className="border p-4 rounded-lg">
                                <span>{c.course_name}</span>

                                <input
                                    type="number"
                                    value={courseIncentives[c._id] || ""}
                                    placeholder={`Fallback: ₹${globalAmount || 0}`}
                                    onChange={(e) =>
                                        handleCourseChange(c._id, e.target.value)
                                    }
                                    className="w-full border px-2 py-1 mt-2"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={handleSave}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
                        >
                            {hasIncentive ? "Update Incentive" : "Save Incentive"}
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