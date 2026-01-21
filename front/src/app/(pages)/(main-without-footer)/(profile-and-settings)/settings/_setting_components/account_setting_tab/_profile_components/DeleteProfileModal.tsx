"use client";
import API from "@/context/API";
import { getErrorResponse, getSuccessResponse } from "@/context/Callbacks";
import { UserProps } from "@/types/UserTypes";
import { useCallback, useState } from "react";

type DeleteProfileModalProps = {
  onClose: () => void;
  profile: UserProps | null;
};

export const DeleteProfileModal = ({
  profile,
  onClose,
}: DeleteProfileModalProps) => {
  const [loading, setLoading] = useState(false);
  const handleDeleteProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.delete(
        `/profile/user/avatar/${profile?.uniqueId || 1}`
      );
      getSuccessResponse(response);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      onClose();
      setLoading(false);
      window.location.reload();
    }
  }, [onClose, profile]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-custom shadow-custom max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-(--text-color-emphasis) mb-4">
            Delete Profile Image
          </h2>
          <p className="text-(--text-color) mb-6">
            Are you sure you want to delete your profile image? This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-(--danger-subtle) text-(--danger-emphasis) rounded-custom transition-all shadow-custom"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteProfile}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-(--danger) text-(--danger-subtle) rounded-custom transition-all shadow-custom"
            >
              Delete Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
