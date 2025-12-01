"use client";

import { useCallback, useEffect, useState } from "react";
import { LuArrowLeft, LuCircleX, LuLoader } from "react-icons/lu";

export default function ErrorCard() {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleContinue = useCallback(() => {
    if (isRedirecting) return;
    setIsRedirecting(true);
  }, [isRedirecting]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleContinue]);

  const handleBack = () => {
    if (isRedirecting) return;
    history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="flex justify-center mb-6">
          <div className="rounded-full p-4 bg-purple-100">
            <LuCircleX className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-3 text-purple-800">
          Verification Failed
        </h1>
        <p className="text-center text-gray-600 mb-6">
          An error occurred while verifying your request. Please try again
          later.
        </p>

        {countdown > 0 && (
          <p className="text-center text-sm text-gray-500 mb-6">
            Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
          </p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleBack}
            disabled={isRedirecting}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium transition bg-red-600 hover:bg-red-700 disabled:opacity-50`}
          >
            {isRedirecting ? (
              <LuLoader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LuArrowLeft className="w-5 h-5" />
                Go Back
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
