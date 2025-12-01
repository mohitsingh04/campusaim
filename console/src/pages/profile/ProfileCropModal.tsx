import React, { useRef, useState } from "react";
import { Cropper, CropperRef } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import { LuX } from "react-icons/lu";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { UserProps } from "../../types/types";
import { API } from "../../contexts/API";
import { createPortal } from "react-dom";

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

  const modalContent = (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--yp-primary)] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[var(--yp-primart)] px-6 py-4 border-b border-[var(--yp-border-primary)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--yp-text-primary)]">
            Profile Image Cropper
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--yp-text-primary)] p-2 rounded-lg transition-all"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <div className="relative bg-[var(--yp-primary)] rounded-xl mb-6 overflow-hidden border-2 border-[var(--yp-border-primary)] flex justify-center items-center">
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

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)] hover:opacity-90 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)] hover:opacity-90 transition"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProfileCropModal;
