import React, { useEffect, useState } from "react";
import { LuCamera } from "react-icons/lu";
import BannerCropModal from "../../_modals/BannerModal";
import { UserProps } from "@/types/types";
import { DeleteBannerModal } from "../../_modals/DeleteBannerModal";

export default function Banner({ profile }: { profile: UserProps | null }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState("");
  const [bannerImage, setBannerImage] = useState<string>();
  const [showDeleteBannerModal, setShowDeleteBannerModal] = useState(false);

  useEffect(() => {
    setBannerImage(
      profile?.banner?.[0]
        ? `${process.env.NEXT_PUBLIC_MEDIA_URL}${profile?.banner?.[0]}`
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
    <div>
      <div className="relative">
        <div
          className="h-80 bg-purple-600 relative"
          style={{
            backgroundImage: bannerImage ? `url(${bannerImage})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-indigo-900/30"></div>
          <div className="absolute top-6 right-6 flex space-x-2">
            <label className="bg-white/90 backdrop-blur-sm hover:bg-white text-purple-700 px-3 py-2 rounded-xl cursor-pointer flex items-center space-x-2 transition-all shadow-lg hover:shadow-xl">
              <LuCamera className="h-4 w-4" />
              <span className="text-xs font-medium">Edit</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            {bannerImage && (
              <button
                onClick={() => setShowDeleteBannerModal(true)}
                className="bg-red-600 text-white px-3 py-2 rounded-xl text-xs hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
      {selectedImage && (
        <BannerCropModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          profile={profile}
          originalFileName={originalFileName}
        />
      )}
      {showDeleteBannerModal && (
        <DeleteBannerModal
          profile={profile}
          onClose={() => setShowDeleteBannerModal(false)}
        />
      )}
    </div>
  );
}
