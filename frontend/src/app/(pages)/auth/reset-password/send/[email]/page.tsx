"use client";
import API from "@/contexts/API";
import { UserProps } from "@/types/types";
import { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LuCircleCheck,
  LuClock,
  LuMail,
  LuMessageSquareWarning,
  LuRefreshCcw,
} from "react-icons/lu";

const ResetPasswordNotice = () => {
  const params = useParams();
  const email = params.email as string | undefined;
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [user, setUser] = useState<UserProps | null>(null);
  const router = useRouter();

  const getUsers = useCallback(async () => {
    if (email) {
      try {
        const response = await API.get(
          `/profile/user/email/${decodeURIComponent(email)}`
        );
        const data = response.data;
        setUser(data);
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        console.log(err.response?.data.error);
      }
    }
  }, [email]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (user) {
      const expiryDate = new Date(user.resetTokenExpiry);
      const tokenExpired = expiryDate.getTime() < Date.now();

      if (!user.resetToken || tokenExpired) {
        router.push("/auth/login");
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = useCallback(async () => {
    setLoading(true);
    try {
      if (email) {
        const response = await API.post("/profile/forgot-password", {
          email: decodeURIComponent(email),
        });
        toast.success(response.data.message);
      }
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      toast.error(err.response?.data?.error || "Something went wrong.");
      if (err.status === 429) {
        setError(
          "You're sending too many requests too quickly. Please wait a moment and try again."
        );
      }
    } finally {
      setTimer(60);
      setLoading(false);
    }
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-100 px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full text-center animate-fadeIn">
        <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
          <LuMail className="text-purple-600 w-7 h-7" />
        </div>

        <h2 className="text-2xl font-bold text-purple-700 mb-2">
          Reset Link Sent
        </h2>

        <p className="text-gray-600 mb-4">
          We&apos;ve sent a password reset link to your email address.
        </p>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 flex items-start gap-2 mb-6">
            <LuMessageSquareWarning className="w-5 h-5 mt-0.5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-start gap-2 mb-6">
            <LuCircleCheck className="w-5 h-5 mt-0.5" />
            <span>
              Please check your inbox and follow the instructions to reset your
              password.
            </span>
          </div>
        )}

        {timer > 0 ? (
          <div className="flex items-center justify-center text-gray-600 text-sm mb-3 gap-2">
            <LuClock className="w-4 h-4" />
            <span>
              Resend available in{" "}
              <span className="font-semibold text-purple-700">
                0:{timer < 10 ? `0${timer}` : timer}
              </span>
            </span>
          </div>
        ) : (
          <button
            onClick={handleResend}
            className="flex items-center gap-2 mx-auto text-sm text-purple-700 font-medium hover:underline mb-3 disabled:opacity-25"
            disabled={loading}
          >
            <LuRefreshCcw className="w-4 h-4" />
            Resend Email
          </button>
        )}

        <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-purple-600 transition-all duration-1000"
            style={{ width: `${((60 - timer) / 60) * 100}%` }}
          />
        </div>

        <p className="text-sm text-gray-500">
          Didn&apos;t receive the email? Check your spam folder or try resending
          it.
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordNotice;
