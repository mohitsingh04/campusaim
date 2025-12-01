import React, { useState, useRef, useEffect } from "react";
import { LuTrash, LuUpload, LuUser } from "react-icons/lu";
import { DeleteProfileModal } from "../_modals/DeleteProfileModal";
import ProfileCropModal from "../_modals/ProfileCropModal";
import { UserProps } from "@/types/types";
import Image from "next/image";

interface ImageUploadProps {
  profile: UserProps | null;
}
const ImageUpload: React.FC<ImageUploadProps> = ({ profile }) => {
  const [currentImage, setCurrentImage] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentImage(
      profile?.avatar?.[0]
        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}${profile?.avatar?.[0]}`
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
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={!currentImage ? handleUploadClick : undefined}
      >
        <div className="w-24 h-24 rounded-full border-4 border-purple-100 shadow-sm overflow-hidden relative">
          {currentImage ? (
            <div className="relative w-full h-full">
              <Image
                src={currentImage}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white">
              <LuUser size={32} />
            </div>
          )}
          {isHovered && !currentImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="p-2 rounded-full transition-colors bg-purple-50/20 cursor-pointer duration-200">
                <LuUpload size={20} className="text-white" />
              </div>
            </div>
          )}

          {isHovered && currentImage && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-2">
              <button
                onClick={handleUploadClick}
                className="p-2 rounded-full transition-colors bg-purple-50/20 cursor-pointer duration-200"
                title="Edit Image"
              >
                <LuUpload size={16} className="text-white" />
              </button>
              <button
                onClick={handleDeleteClick}
                className="p-2 rounded-full transition-colors cursor-pointer bg-purple-50/20 duration-200"
                title="Delete Image"
              >
                <LuTrash size={16} className="text-white" />
              </button>
            </div>
          )}
        </div>

        <LuUpload
          size={26}
          className="absolute md:hidden block bottom-1 right-1 text-gray-50 bg-purple-700 rounded-full p-1.5 border-white border-2"
        />
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
};

export default ImageUpload;
