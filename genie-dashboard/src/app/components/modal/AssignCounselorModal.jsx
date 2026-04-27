import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API, CampusaimAPI } from "../../services/API";
import Select from "react-select";

export default function AssignCounselorModal({
    teamLeaderId,
    onClose,
    onAssigned
}) {

    const [counselors, setCounselors] = useState([]);
    const [selectedCounselorId, setSelectedCounselorId] = useState("");
    const [loading, setLoading] = useState(false);

    /* ---------------- Fetch Counselors ---------------- */
    useEffect(() => {
        const fetchCounselors = async () => {
            try {
                const res = await CampusaimAPI.get("/fetch-counselors");
                setCounselors(res.data.data || []);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load counselors");
            }
        };

        fetchCounselors();
    }, []);

    /* ---------------- Assign Counselor ---------------- */
    const handleAssign = async () => {

        if (!selectedCounselorId) {
            toast.error("Select a counselor");
            return;
        }

        try {
            setLoading(true);

            await API.put(`/users/${selectedCounselorId}/assign-teamleader`, {
                teamLeaderId
            });

            toast.success("Counselor assigned successfully");

            onAssigned();
            onClose();

        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.error || "Assignment failed");
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async () => {
        if (!selectedCounselorId) {
            toast.error("Select a counselor first");
            return;
        }

        try {
            setLoading(true);

            await API.put(`/users/${selectedCounselorId}/assign-teamleader`, {
                teamLeaderId: null
            });

            toast.success("Counselor unassigned");

            onAssigned();
            onClose();

        } catch (err) {
            console.error(err);
            toast.error("Failed to unassign counselor");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- React Select Options ---------------- */
    const counselorOptions = counselors.map((c) => ({
        value: c._id,
        label: `${c.name} (${c.email})`,
        teamLeader: c.teamLeader
    }));

    const formatOptionLabel = (option) => (
        <div className="flex items-center justify-between w-full">
            <span className="text-sm">
                {option.label}
            </span>

            {option.teamLeader ? (
                <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white">
                    Assigned To → {option.teamLeader.name}
                </span>
            ) : (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-700">
                    Unassigned
                </span>
            )}
        </div>
    );

    const selectedCounselor = counselorOptions.find(opt => opt.value === selectedCounselorId) || null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">

                <h3 className="text-lg font-semibold">
                    Assign Counselor
                </h3>

                <Select
                    options={counselorOptions}
                    value={selectedCounselor}
                    onChange={(option) => setSelectedCounselorId(option?.value || "")}
                    placeholder="Select Counselor"
                    isClearable
                    className="w-full"
                    formatOptionLabel={formatOptionLabel}
                />

                <div className="flex justify-between gap-2">

                    <button
                        onClick={handleUnassign}
                        disabled={loading || !selectedCounselor?.teamLeader}
                        title={!selectedCounselor?.teamLeader ? "Counselor is not assigned" : ""}
                        className={`px-4 py-2 text-sm rounded text-white
        ${selectedCounselor?.teamLeader
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-gray-300 cursor-not-allowed"
                            }`}
                    >
                        Unassign
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleAssign}
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Assign"}
                        </button>
                    </div>

                </div>

            </div>

        </div>
    );
}