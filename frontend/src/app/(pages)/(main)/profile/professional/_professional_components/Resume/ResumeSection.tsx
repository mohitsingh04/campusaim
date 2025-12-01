import React, { useState } from "react";
import { LuDownload, LuEye, LuPlus } from "react-icons/lu";
import { ResumeModal } from "./ResumeModal";
import { UserProps } from "@/types/types";
import Link from "next/link";

export default function ResumeSection({
  profile,
  getProfile,
}: {
  profile: UserProps | null;
  getProfile: () => void;
}) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-purple-50 px-6 py-4 border-b border-purple-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
          <LuDownload className="h-5 w-5 text-purple-600" />
          <span>Resume/CV</span>
        </h3>
      </div>
      <div className="p-6">
        {profile?.resume ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link
                href={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${profile?.resume}`}
                target="_blank"
                className="bg-purple-500 hover:bg-purple-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all"
              >
                <LuEye className="h-4 w-4" />
                <span className="text-sm font-medium">View</span>
              </Link>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-xl"
              >
                <LuDownload className="h-4 w-4" />
                <span className="text-sm font-medium">Update</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <LuDownload className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-4">
              Upload your resume to showcase your qualifications
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-md"
            >
              <LuPlus className="h-4 w-4" />
              <span className="font-medium">Upload CV</span>
            </button>
          </div>
        )}
      </div>
      {showUploadModal && (
        <ResumeModal
          profile={profile}
          closeModal={() => setShowUploadModal(false)}
          onUploaded={getProfile}
        />
      )}
    </div>
  );
}
