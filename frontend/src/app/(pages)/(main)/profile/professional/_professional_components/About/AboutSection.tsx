import { UserProps } from "@/types/types";
import React, { useState } from "react";
import { LuPen, LuUser } from "react-icons/lu";
import EditAboutModal from "./EditAboutModal";

export default function AboutSection({
  profile,
  getProfile,
}: {
  profile: UserProps | null;
  getProfile: () => void;
}) {
  const [showEditAboutModal, setShowEditAboutModal] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <LuUser className="h-5 w-5 text-purple-600" />
            <span>About</span>
          </h2>
          <button
            onClick={() => setShowEditAboutModal(true)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 p-2 rounded-lg transition-all"
          >
            <LuPen className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {profile?.about ? (
          <p className="text-gray-700 leading-relaxed text-lg">
            {profile?.about}
          </p>
        ) : (
          <div className="text-center py-8">
            <LuUser className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 italic">
              Add information about yourself to help others know you better...
            </p>
            <button
              onClick={() => setShowEditAboutModal(true)}
              className="mt-4 bg-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
            >
              Add About Info
            </button>
          </div>
        )}
      </div>
      {showEditAboutModal && (
        <EditAboutModal
          profile={profile}
          onClose={() => setShowEditAboutModal(false)}
          onSave={getProfile}
        />
      )}
    </div>
  );
}
