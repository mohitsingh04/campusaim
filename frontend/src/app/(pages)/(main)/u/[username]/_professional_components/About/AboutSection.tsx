import { UserProps } from "@/types/types";
import React from "react";
import { LuUser } from "react-icons/lu";

export default function AboutSection({
  profile,
}: {
  profile: UserProps | null;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <LuUser className="h-5 w-5 text-purple-600" />
            <span>About</span>
          </h2>
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
              No information available for this {profile?.name}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
