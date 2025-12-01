import { UserProps } from "@/types/types";
import React, { useEffect, useState } from "react";
import { LuCamera, LuTrash } from "react-icons/lu";
import ProfileCropModal from "../../_modals/ProfileCropModal";
import { DeleteProfileModal } from "../../_modals/DeleteProfileModal";
import Image from "next/image";

export default function ProfileImage({
  profile,
}: {
  profile: UserProps | null;
}) {
  const [profileImage, setProfileImage] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);

  useEffect(() => {
    setProfileImage(
      profile?.avatar?.[0]
        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${profile?.avatar?.[0]}`
        : ""
    );
  }, [profile]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          setSelectedImage(result);
        }
        setOriginalFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      <div className="h-40 w-40 rounded-2xl border-2 border-purple-400 mt-2 bg-gradient-to-br from-purple-100 to-indigo-100 overflow-hidden">
        {profileImage ? (
          <div className="relative w-full h-full">
            <Image
              src={profileImage}
              alt={profile?.username || "Profile"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-full w-full bg-purple-600 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">
              {profile?.name?.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <div className="absolute -bottom-2 -right-2 flex space-x-2">
        <label className="bg-purple-600 border-2  text-white p-2 rounded-full cursor-pointer hover:shadow-md hover:shadow-purple-100 hover:bg-purple-700 transition">
          <LuCamera className="w-4 h-4" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
        {profileImage && (
          <button
            onClick={() => setShowDeleteProfileModal(true)}
            className="bg-red-600 border-2 text-white p-2 rounded-full hover:bg-red-700 transition"
          >
            <LuTrash className="w-4 h-4" />
          </button>
        )}
      </div>
      {selectedImage && (
        <ProfileCropModal
          profile={profile}
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          originalFileName={originalFileName}
        />
      )}
      {showDeleteProfileModal && (
        <DeleteProfileModal
          profile={profile}
          onClose={() => setShowDeleteProfileModal(false)}
        />
      )}
    </div>
  );
}
