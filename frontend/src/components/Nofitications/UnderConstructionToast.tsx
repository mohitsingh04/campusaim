"use client";

import { useState } from "react";
import { LuConstruction, LuX } from "react-icons/lu";
export default function UnderConstructionToast() {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed bottom-0 md:bottom-5 right-0 md:right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="md:max-w-sm w-full bg-white border-l-4 border-white md:border-red-600 md:rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="text-red-600 text-xl">
          <LuConstruction className="w-6 h-10" />
        </div>
        <div className="flex-1 text-sm text-red-600">
          <div className="font-bold mb-0.5">Site Under Construction</div>
          <div>We are working to improve your experience.</div>
        </div>
        <button
          onClick={() => setShow(false)}
          className="text-gray-400 hover:text-gray-600 transition"
          aria-label="Close"
        >
          <LuX size={18} />
        </button>
      </div>
    </div>
  );
}
