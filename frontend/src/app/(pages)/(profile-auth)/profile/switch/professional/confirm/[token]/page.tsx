"use client";

import Loader from "@/components/Loader/Loader";
import API from "@/contexts/API";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuCircleX,
  LuLoader,
} from "react-icons/lu";

interface NotificationState {
  loading: boolean;
  success: boolean;
  error: string;
  title: string;
  message: string;
}

export default function SwitchProfessionalConfirm() {
  const { token } = useParams();
  const router = useRouter();

  const [state, setState] = useState<NotificationState>({
    loading: true,
    success: false,
    error: "",
    title: "",
    message: "",
  });

  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setState({
          loading: false,
          success: false,
          error: "No token provided",
          title: "Invalid Request",
          message: "The verification link is missing required information.",
        });
        return;
      }

      try {
        const response = await API.get(
          `/profile/user/switch/professional/${token}`
        );

        if (response.data.message) {
          setState({
            loading: false,
            success: true,
            error: "",
            title: "Successfully",
            message:
              response.data.message ||
              "Your account has been permanently Switched. Thank you for using our service.",
          });
        }
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        const errorMessage =
          err?.response?.data?.error || err?.message || "Something went wrong.";
        setState({
          loading: false,
          success: false,
          error: "Error",
          title: "Verification Failed",
          message: errorMessage,
        });
      }
    };

    verifyToken();
  }, [token]);
  const handleRedirect = useCallback(() => {
    if (isRedirecting) return;
    setIsRedirecting(true);
    router.push("/auth/login");
  }, [router, isRedirecting]);

  useEffect(() => {
    if (state.loading) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.loading, handleRedirect]);

  const handleBack = () => {
    if (isRedirecting) return;
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="flex justify-center mb-6">
          <div className="rounded-full p-4 bg-purple-100">
            {state.loading ? (
              <Loader />
            ) : state.success ? (
              <LuCircleCheck className="w-12 h-12 text-green-600" />
            ) : (
              <LuCircleX className="w-12 h-12 text-red-600" />
            )}
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center mb-3 text-purple-800">
          {state.loading ? "Verifying Request" : state.title}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {state.loading
            ? "Please wait while we process your request..."
            : state.message}
        </p>

        {!state.loading && countdown > 0 && (
          <p className="text-center text-sm text-gray-500 mb-6">
            Redirecting to login in {countdown} second
            {countdown !== 1 ? "s" : ""}...
          </p>
        )}

        {!state.loading && (
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRedirect}
              disabled={isRedirecting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium transition ${
                state.success
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50`}
            >
              {isRedirecting ? (
                <LuLoader className="w-5 h-5 animate-spin" />
              ) : (
                <>Continue</>
              )}
            </button>
            <button
              onClick={handleBack}
              disabled={isRedirecting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-gray-300 text-gray-800 hover:bg-gray-100 transition disabled:opacity-50"
            >
              <LuArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
