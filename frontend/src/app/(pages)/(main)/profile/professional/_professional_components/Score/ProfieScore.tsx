import React, { useState } from "react";
import { LuTarget } from "react-icons/lu";
import { UserProps } from "@/types/types";
import ProfileScoreModal from "./ProfileScoreModal";
import ScoreProgress from "./ScoreProgress";

export default function ProfileScore({
  profile,
}: {
  profile: UserProps | null;
}) {
  const [showProgresModal, setShowProgressModal] = useState(false);
  const score = profile?.score ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:shadow-purple-100 border border-purple-100 overflow-hidden">
      <div className="bg-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <LuTarget className="h-5 w-5 text-purple-600" />
          <span>Profile Score</span>
        </h3>
      </div>
      <div className="p-6">
        <ScoreProgress score={score} />
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            {score < 100
              ? "Complete your profile to improve your score"
              : "Your profile is complete!"}
          </p>
          <button
            onClick={() => setShowProgressModal(true)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl transition-all hover:shadow-md text-sm font-medium"
          >
            {score < 100 ? "Improve Score" : "View Details"}
          </button>
        </div>
      </div>
      {showProgresModal && (
        <ProfileScoreModal profile={profile} onClose={() => setShowProgressModal(false)} />
      )}
    </div>
  );
}
