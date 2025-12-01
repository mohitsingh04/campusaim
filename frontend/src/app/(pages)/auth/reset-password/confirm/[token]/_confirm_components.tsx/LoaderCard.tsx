"use client";

import { LuLoader } from "react-icons/lu";

export default function LoaderCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="flex justify-center mb-6">
          <div className="rounded-full p-4 bg-purple-100">
            <LuLoader className="w-12 h-12 text-purple-600 animate-spin" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-3 text-purple-800">
          Verifying Request
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Please wait while we process your request...
        </p>
      </div>
    </div>
  );
}
