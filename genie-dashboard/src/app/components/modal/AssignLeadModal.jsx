import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import toast from "react-hot-toast";
import { API, CampusaimAPI } from "../../services/API";
import { useAuth } from "../../context/AuthContext";

const capitalizeRole = (role) =>
    role?.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

export default function AssignLeadModal({
    leadIds,
    currentLead,
    onClose,
    onAssigned
}) {
    const { authUser } = useAuth();

    const [options, setOptions] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const [loading, setLoading] = useState(false);

    /* ---------------- Load assignable users ---------------- */
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await CampusaimAPI.get("/fetch-counselor-teamleader");

                const { counselors = [], teamleaders = [] } = res.data?.data || {};

                // 🔥 merge both arrays
                const users = [...teamleaders, ...counselors];

                setOptions(
                    users.map(u => ({
                        value: u._id,
                        label: `${u.name} • ${capitalizeRole(u.role?.role)} • ${u.email}`,
                        role: u.role
                    }))
                );

            } catch (err) {
                console.error(err);
                toast.error("Failed to load users");
            }
        };

        fetchUsers();
    }, [authUser.role]);

    /* ---------------- Default selected user ---------------- */
    useEffect(() => {
        if (!options.length || !currentLead) return;

        let defaultId = null;

        if (currentLead.assignedTo) {
            defaultId = currentLead.assignedTo._id || currentLead.assignedTo;
        } else if (currentLead.teamLeader) {
            defaultId = currentLead.teamLeader._id || currentLead.teamLeader;
        }

        const match = options.find(o => o.value === defaultId);
        setSelectedOption(match || null);

    }, [options, currentLead]);

    /* ---------------- Assign ---------------- */
    const handleAssign = async () => {
        if (loading) return; // 🔒 hard guard

        if (!selectedOption) {
            return toast.error("Select TeamLeader or Counselor");
        }

        try {
            setLoading(true);

            const res = await API.put("/assign/lead", {
                leadIds,
                assignToId: selectedOption.value
            });

            if (res.data?.noChange) {
                toast(res.data.message, { icon: "ℹ️" });
            } else {
                toast.success(res.data?.message || "Leads assigned successfully");
            }

            onAssigned();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || "Assignment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">Assign Leads</h3>

                <Select
                    options={options}
                    value={selectedOption}
                    onChange={setSelectedOption}
                    placeholder="Select TeamLeader / Counselor"
                    isClearable
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleAssign}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
                    >
                        Assign
                    </button>
                </div>
            </div>
        </div>
    );
}
