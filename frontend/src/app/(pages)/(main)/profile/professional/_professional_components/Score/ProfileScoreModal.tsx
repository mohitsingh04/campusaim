import React from "react";
import {
  LuUser,
  LuImage,
  LuPhone,
  LuType,
  LuMapPin,
  LuFileText,
  LuBriefcase,
  LuGraduationCap,
  LuSparkles,
  LuLanguages,
  LuDownload,
  LuX,
  LuCheck,
} from "react-icons/lu";
import ScoreProgress from "./ScoreProgress";
import { UserProps } from "@/types/types";

interface ProfileScoreModalProps {
  onClose: () => void;
  profile: UserProps | null;
}

const ProfileScoreModal: React.FC<ProfileScoreModalProps> = ({
  profile,
  onClose,
}) => {
  const score = profile?.score ?? 0;

  const scoreItems = [
    {
      icon: LuUser,
      title: "Avatar",
      description: "Upload a clear, professional profile picture.",
      completed: (profile?.avatar?.length || 0) > 0,
    },
    {
      icon: LuImage,
      title: "Banner",
      description: "Add a banner image to personalize your profile background.",
      completed: (profile?.banner?.length || 0) > 0,
    },
    {
      icon: LuPhone,
      title: "Alt Phone Number",
      description: "Add an alternate contact number for easier reachability.",
      completed: profile?.alt_mobile_no,
    },
    {
      icon: LuType,
      title: "Heading",
      description: "Add a professional headline to showcase your focus.",
      completed: profile?.heading,
    },
    {
      icon: LuMapPin,
      title: "Location",
      description: "Add your complete address to improve discoverability.",
      completed:
        profile?.address &&
        profile?.pincode &&
        profile?.city &&
        profile?.state &&
        profile?.country,
    },
    {
      icon: LuFileText,
      title: "About",
      description: "Write a compelling summary to introduce yourself.",
      completed: profile?.about,
    },
    {
      icon: LuBriefcase,
      title: "Work Experience",
      description: "Add your work history to strengthen your credibility.",
      completed: (profile?.experiences?.length || 0) > 0,
    },
    {
      icon: LuGraduationCap,
      title: "Education",
      description: "Showcase your educational background and achievements.",
      completed: (profile?.education?.length || 0) > 0,
    },
    {
      icon: LuSparkles,
      title: "Skills",
      description: "List your skills to highlight your expertise.",
      completed: (profile?.skills?.length || 0) > 0,
    },
    {
      icon: LuLanguages,
      title: "Languages",
      description:
        "List languages you speak to connect with diverse opportunities.",
      completed: (profile?.languages?.length || 0) > 0,
    },
    {
      icon: LuDownload,
      title: "Resume/CV",
      description: "Upload your resume to showcase your qualifications.",
      completed: profile?.resume,
    },
  ];

  const completedItems = scoreItems.filter((item) => item.completed).length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile Score</h2>
            <p className="text-gray-600">
              Complete your profile to improve visibility
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="text-center mb-8">
            <ScoreProgress score={score} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {completedItems} of {scoreItems.length} sections completed
            </h3>
            <p className="text-gray-600">
              {scoreItems.length === completedItems
                ? "Congratulations! Your profile is complete."
                : `Complete ${
                    scoreItems.length - completedItems
                  } more sections to reach 100%`}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Sections
            </h4>
            {scoreItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    item.completed
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.completed ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {item.completed ? (
                        <LuCheck className="h-6 w-6 text-white" />
                      ) : (
                        <Icon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">
                        {item.title}
                      </h5>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScoreModal;
