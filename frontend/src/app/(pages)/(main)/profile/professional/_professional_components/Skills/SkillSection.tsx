import { AllSkillsProps, UserProps } from "@/types/types";
import React, { useState } from "react";
import { LuPen, LuTarget } from "react-icons/lu";
import { getSkillNameById } from "@/contexts/Callbacks";
import SkillsModal from "./SkillsModal";

export default function SkillSection({
  profile,
  allSkills,
  getProfile,
}: {
  profile: UserProps | null;
  allSkills: AllSkillsProps[];
  getProfile: () => void;
}) {
  const [showSkillsEditForm, setShowSkillsEditForm] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <LuTarget className="h-5 w-5 text-purple-600" />
            <span>Skills</span>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              {profile?.skills.length}
            </span>
          </h2>
          <button
            onClick={() => setShowSkillsEditForm(true)}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 p-2 rounded-lg transition-all"
          >
            <LuPen className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {(profile?.skills.length || 0) > 0 ? (
          <div className="flex flex-wrap gap-3">
            {profile?.skills?.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-6 py-2 rounded-lg text-sm font-medium bg-purple-100 to-emerald-100 text-purple-800 hover:shadow-sm transition-all"
              >
                {getSkillNameById(skill, allSkills)}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <LuTarget className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 italic">
              Add Skills you speak to connect with more people...
            </p>
            <button
              onClick={() => setShowSkillsEditForm(true)}
              className="mt-4 bg-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-sm  hover:shadow-purple-100 transition-all"
            >
              Add Skills
            </button>
          </div>
        )}
      </div>
      {showSkillsEditForm && (
        <SkillsModal
          profile={profile}
          allSkills={allSkills}
          getProfile={getProfile}
          onClose={() => setShowSkillsEditForm(false)}
        />
      )}
    </div>
  );
}
