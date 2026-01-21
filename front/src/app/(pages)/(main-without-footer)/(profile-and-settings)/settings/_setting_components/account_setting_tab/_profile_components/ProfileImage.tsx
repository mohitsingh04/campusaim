import { getUserAvatar } from "@/context/Callbacks";
import { UserProps } from "@/types/UserTypes";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { BiCamera, BiTrash } from "react-icons/bi";
import { DeleteProfileModal } from "./DeleteProfileModal";
import ProfileCropModal from "./ProfileCropModal";

export default function ProfileImage({
  profile,
}: {
  profile: UserProps | null;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleUploadClick = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>
  ) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };
  return (
    <>
      <div className="relative w-32 h-32 md:mt-0" onClick={handleUploadClick}>
        <Image
          src={getUserAvatar(profile?.avatar || [])}
          alt={profile?.name || ""}
          fill
          className="rounded-custom object-cover"
        />
        {profile?.avatar && profile.avatar.length > 0 && (
          <button
            type="button"
            onClick={handleDeleteClick}
            className="absolute bottom-0 right-8 bg-(--danger) text-white p-1.5 rounded-full shadow-md hover:opacity-80 transition cursor-pointer"
          >
            <BiTrash size={14} />
          </button>
        )}
        <button
          className="absolute bottom-0 right-0 bg-(--secondary-bg) p-1.5 rounded-full shadow-md hover:opacity-80 transition cursor-pointer"
          type="button"
          onClick={handleUploadClick}
        >
          <BiCamera size={14} className="text-(--text-color-emphasis)" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {selectedImage && (
        <ProfileCropModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          profile={profile}
          originalFileName={originalFileName}
        />
      )}

      {showDeleteDialog && (
        <DeleteProfileModal
          profile={profile}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </>
  );
}
