"use client";
import API from "@/contexts/API";
import { UserProps } from "@/types/types";
import { AxiosError } from "axios";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";

type DeleteBannerModalProps = {
  onClose: () => void;
  profile: UserProps | null;
};

export const DeleteBannerModal = ({
  profile,
  onClose,
}: DeleteBannerModalProps) => {
  const [loading, setLoading] = useState(false);
  const handleDeleteBanner = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.delete(
        `/profile/professional/banner/${profile?.uniqueId}`
      );
      toast.success(response.data.message);
      location.reload();
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data.error || "Something went Wrong");
    } finally {
      onClose();
      setLoading(false);
      window.location.reload();
    }
  }, [onClose, profile]);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Delete Banner Image
          </h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete your Banner image? This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteBanner}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Delete Banner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
