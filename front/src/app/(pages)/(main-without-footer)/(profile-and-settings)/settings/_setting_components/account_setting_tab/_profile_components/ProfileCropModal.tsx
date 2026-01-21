import React, { useRef, useState } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { LuX } from "react-icons/lu";
import { UserProps } from "@/types/UserTypes";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";

interface ProfileCropModalProps {
  image: string;
  onClose: () => void;
  profile: UserProps | null;
  originalFileName: string;
}

const ProfileCropModal: React.FC<ProfileCropModalProps> = ({
  image,
  onClose,
  profile,
  originalFileName,
}) => {
  const cropperRef = useRef<CropperRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const cropper = cropperRef.current;

    if (cropper) {
      const canvas = cropper.getCanvas();
      if (canvas) {
        canvas.toBlob(
          async (blob: Blob | null) => {
            if (!blob) return;

            const formData = new FormData();
            formData.append("avatar", blob, originalFileName);

            try {
              await API.patch(
                `/profile/user/avatar/${profile?.uniqueId}`,
                formData
              );
              window.location.reload();
            } catch (error) {
              getErrorResponse(error);
            } finally {
              setIsLoading(false);
            }
          },
          "image/jpeg",
          0.9
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-(--primary-bg) rounded-custom max-w-2xl w-full shadow-custom overflow-hidden">
        <div className="bg-(--secondary-bg) px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Profile Image Cropper
          </h2>
          <button
            onClick={onClose}
            className="text-(--text-color) hover:text-(--text-color-emphasis) p-2 rounded-custom transition-all"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="relative rounded-custom mb-6 overflow-hidden border-2 border-(--border) flex justify-center items-center">
            <div className="w-full max-w-md aspect-square">
              <Cropper
                ref={cropperRef}
                src={image}
                className="cropper w-full h-full"
                stencilProps={{
                  aspectRatio: 1,
                  movable: true,
                  resizable: true,
                }}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-(--danger-subtle) text-(--danger-emphasis) rounded-custom transition-all shadow-custom font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-3 btn-shine rounded-custom"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCropModal;
