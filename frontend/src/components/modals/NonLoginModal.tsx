import GoogleLoginButton from "@/app/(pages)/auth/_googleLogin/GoogleLoginButton";
import Link from "next/link";
import React from "react";
import { LuX, LuUser } from "react-icons/lu";

interface NonLoginModalProps {
  closeModal: () => void;
}

export function NonLoginModal({ closeModal }: NonLoginModalProps) {
  return (
    <div className="fixed !m-0 inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <LuUser className="h-6 w-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-600">Login Required</h2>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
          >
            <LuX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          {/* Friendly message above buttons */}
          <p className="text-gray-700 text-lg">
            Oops! Looks like you’re not logged in yet. 😊
          </p>
          <p className="text-gray-500">
            Please log in to continue and enjoy all the features.
          </p>

          {/* Login Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <GoogleLoginButton />
            <Link
              href={`/auth/login`}
              className="flex items-center justify-center w-full px-5 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-md"
            >
              <i className="fa-regular fa-envelope mr-2"></i>
              Continue with Email
            </Link>
          </div>

          {/* Friendly message below buttons */}
          <p className="text-gray-400 text-sm mt-4">
            Don’t worry, it only takes a few seconds! 🚀
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end bg-gradient-to-r from-gray-50 to-indigo-50 p-4 border-t border-gray-100">
          <button
            onClick={closeModal}
            className="px-6 py-3 border-2 border-gray-600 hover:border-gray-800 rounded-xl text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
