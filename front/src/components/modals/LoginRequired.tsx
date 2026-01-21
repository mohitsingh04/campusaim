"use client";
import GoogleLoginButton from "@/app/(pages)/(auth)/auth/_googleLogin/GoogleLoginButton";
import Link from "next/link";
import React from "react";
import { LuMail, LuSmile, LuX } from "react-icons/lu";

const LoginRequiredModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-(--primary-bg) text-(--text-color) w-full max-w-md rounded-custom shadow-custom animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center bg-(--secondary-bg) text-(--text-color) rounded-t-lg p-5 py-3">
          <h2 className="text-xl font-semibold">Login Required</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-(--primary-bg) rounded-full"
          >
            <LuX size={20} className="cursor-pointer" />
          </button>
        </div>
        <div className="p-5">
          <p className="text-center mb-1 flex gap-2 items-center justify-center ">
            Oops! Looks like you’re not logged in yet.{" "}
            <LuSmile className="text-yellow-500 h-4 w-4" />
          </p>
          <p className="text-center text-(--text-color-emphasis) text-sm mb-6">
            Please log in to continue and enjoy all the features.
          </p>

          <div className="flex flex-col gap-3">
            <GoogleLoginButton />
            <Link
              href={`/auth/login`}
              className="w-full bg-(--text-color) text-(--primary-bg)  rounded-custom py-2 shadow-custom flex items-center justify-center gap-2 transition cursor-pointer font-medium paragraph"
            >
              <LuMail className="h-4 w-4" />
              Continue with Email
            </Link>
          </div>

          <p className="text-center mt-5">
            Don’t worry, it only takes a few seconds!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRequiredModal;
