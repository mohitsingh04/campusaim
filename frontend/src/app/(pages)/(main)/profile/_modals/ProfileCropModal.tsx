import React, { useRef, useState } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { LuX } from "react-icons/lu";
import { toast } from "react-hot-toast";
import API from "@/contexts/API";
import { UserProps } from "@/types/types";
import { AxiosError } from "axios";

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
                formData,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
              window.location.reload();
            } catch (error) {
              const err = error as AxiosError<{ error: string }>;
              toast.error(
                err.response?.data?.error || "Failed to upload avatar"
              );
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
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-purple-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Profile Image Cropper
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-6 overflow-hidden border-2 border-purple-200 flex justify-center items-center">
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
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all shadow-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg font-medium disabled:opacity-50"
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
