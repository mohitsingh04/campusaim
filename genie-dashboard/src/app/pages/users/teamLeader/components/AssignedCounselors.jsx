import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API } from "../../../../services/API";
import { useNavigate } from "react-router-dom";
import AssignCounselorModal from "../../../../components/modal/AssignCounselorModal";
import AvatarCell from "../../../../components/common/AvatarCell/AvatarCell";

export default function AssignedCounselors({ teamLeaderData }) {
  const [counselors, setCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [assignUser, setAssignUser] = useState(null);

  const teamLeaderId = teamLeaderData?._id;

  const fetchAssignedCounselors = async () => {
    try {
      setIsLoading(true);
      const res = await API.get(
        `/users/teamleaders/${teamLeaderId}/counselors`
      );
      setCounselors(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned counselors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teamLeaderId) fetchAssignedCounselors();
  }, [teamLeaderId]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading counselors…</p>;
  }

  return (
    <>
      <div className="space-y-4 border rounded-md bg-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">
            Assigned Counselors
          </h3>

          <button
            onClick={() => setAssignUser({})}
            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Assign Counselor
          </button>
        </div>

        {/* List */}
        <ul className="divide-y border rounded-md bg-white">
          {!counselors.length && (
            <p className="p-3">No counselors assigned to this team leader</p>
          )}
          {counselors.map((c) => (
            <li
              key={c._id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
            >

              {/* Counselor info */}
              <div className="flex flex-col">
              <AvatarCell user={c} />
              </div>

              {/* Right side */}
              <div className="flex items-center gap-3">

                {/* Leads count */}
                <span
                  className={`px-2 py-1 text-xs rounded-full font-medium
              ${c.leadCount > 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500"
                    }
            `}
                >
                  {c.leadCount} lead{c.leadCount !== 1 ? "s" : ""}
                </span>

                {/* View */}
                <button
                  onClick={() =>
                    navigate(`/dashboard/users/counselors/view/${c._id}`)
                  }
                  className="px-3 py-1.5 text-xs font-medium rounded-md border hover:bg-gray-100"
                >
                  View
                </button>

                {/* Reassign */}
                <button
                  onClick={() => setAssignUser(c)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md border bg-purple-50 text-purple-700 hover:bg-purple-100"
                >
                  Reassign
                </button>

              </div>
            </li>
          ))}
        </ul>
      </div>

      {assignUser && (
        <AssignCounselorModal
          teamLeaderId={teamLeaderId}
          counselor={assignUser}
          onClose={() => setAssignUser(null)}
          onAssigned={fetchAssignedCounselors}
        />
      )}
    </>
  );
}
