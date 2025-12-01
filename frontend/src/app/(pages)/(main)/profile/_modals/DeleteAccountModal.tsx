import API from "@/contexts/API";
import { UserProps } from "@/types/types";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { LuTriangleAlert, LuX } from "react-icons/lu";

const DeleteAccountModal = ({
  onClose,
  profile,
}: {
  onClose: () => void;
  profile: UserProps | null;
}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeleteAccountMail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.post(
        `/profile/delete/account/${profile?.uniqueId}`
      );
      if (response) {
        router.push(`/profile/delete-account/${profile?.email}`);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [router, profile]);
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <LuX size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-full">
              <LuTriangleAlert size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Are you sure?</h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Deleting your account will permanently remove all your data,
            including your profile information, settings, and any associated
            content. This action is irreversible.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccountMail}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-45"
              disabled={loading}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
