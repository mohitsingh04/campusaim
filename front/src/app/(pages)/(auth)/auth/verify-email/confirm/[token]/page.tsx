"use client";
import API from "@/context/API";
import { TokenConfimationProps } from "@/types/Types";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuCircleX,
  LuLoader,
} from "react-icons/lu";

export default function VerifyEmailConfirm() {
  const { token } = useParams();
  const router = useRouter();

  const [state, setState] = useState<TokenConfimationProps>({
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
        const response = await API.get(`/profile/verify-email/${token}`);

        if (response.data.message) {
          setState({
            loading: false,
            success: true,
            error: "",
            title: "Successfully",
            message:
              response.data.message ||
              "Your account has been permanently deleted. Thank you for using our service.",
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
    router.push(`/`);
  };

  return (
    <div className="flex flex-col items-center w-full text-center">
      <div className="flex justify-center mb-3">
        {state.loading ? (
          <div className="rounded-full p-4 bg-(--main-light)">
            <LuLoader className="w-12 h-12 text-(--main) animate-spin" />
          </div>
        ) : state.success ? (
          <div className="rounded-full p-4 bg-(--success-subtle)">
            <LuCircleCheck className="w-12 h-12 text-(--success)" />
          </div>
        ) : (
          <div className="rounded-full p-4 bg-(--danger-subtle)">
            <LuCircleX className="w-12 h-12 text-(--danger)" />
          </div>
        )}
      </div>
      <h1
        className={`text-2xl font-bold text-center ${
          state.loading
            ? "text-(--main)"
            : state.success
            ? "text-(--success)"
            : "text-(--danger)"
        }`}
      >
        {state.loading ? "Verifying Request" : state.title}
      </h1>
      <p className="text-center text-gray-600 my-3">
        {state.loading
          ? "Please wait while we process your request..."
          : state.message}
      </p>

      {!state.loading && countdown > 0 && (
        <p className="text-center text-sm text-gray-500 mb-3">
          Redirecting to login in {countdown} second
          {countdown !== 1 ? "s" : ""}...
        </p>
      )}

      {!state.loading && (
        <div className="flex flex-col gap-3 w-full">
          <button
            //   onClick={handleRedirect}
            disabled={isRedirecting}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-white font-medium transition ${
              state.success ? "bg-(--success)" : "bg-(--danger)"
            } disabled:opacity-50 hover:opacity-80`}
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
  );
}
