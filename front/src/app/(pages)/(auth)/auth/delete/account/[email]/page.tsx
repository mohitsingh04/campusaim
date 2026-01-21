"use client";

import API from "@/context/API";
import { getErrorResponse, getSuccessResponse } from "@/context/Callbacks";
import { UserProps } from "@/types/UserTypes";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const RESEND_TIME = 60;
  const LINK_VALID_MINUTES = 5;

  const { email } = useParams();
  const finalEmail = decodeURIComponent(String(email));
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState(RESEND_TIME);
  const [isResending, setIsResending] = useState(false);

  const [user, setUser] = useState<UserProps | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const response = await API.get(`/profile/user/email/${finalEmail}`);
        if (!active) return;
        setUser(response.data || null);
      } catch (error) {
        setUser(null);
        getErrorResponse(error, true);
      } finally {
        if (active) {
          setUserLoading(false);
          setUserChecked(true);
        }
      }
    };

    fetchUser();

    return () => {
      active = false;
    };
  }, [finalEmail]);

  useEffect(() => {
    if (!userChecked) return;

    if (!user) {
      router.replace("/auth/login");
    }
  }, [userChecked, user, router]);

  useEffect(() => {
    if (timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleResendDeleteMail = async () => {
    if (!user) return;

    setIsResending(true);
    try {
      const response = await API.post(
        `/profile/delete/account/${user.uniqueId}`
      );
      getSuccessResponse(response);
      setTimeLeft(RESEND_TIME);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setIsResending(false);
    }
  };

  if (userLoading || !userChecked) {
    return (
      <div className="text-center text-sm text-slate-500">
        Verifying your request…
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm text-slate-600 mb-4 leading-relaxed">
        An account deletion email has been sent to
        <span className="font-medium text-slate-800"> {finalEmail}</span>
      </p>

      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4">
        <p className="text-sm text-slate-600 leading-relaxed">
          Open the email and follow the link to{" "}
          <span className="text-(--danger) font-bold">permanently delete</span>{" "}
          your account.
          <br />
          <span className="text-xs text-slate-500 block mt-1">
            The link will expire after {LINK_VALID_MINUTES} minutes.
          </span>
        </p>
      </div>

      <div className="my-3 text-xs text-slate-500">
        Can’t find the email? Check your spam folder or wait before requesting a
        new one.
      </div>

      <button
        onClick={handleResendDeleteMail}
        disabled={timeLeft > 0 || isResending}
        className={`w-full h-11 rounded-xl text-sm font-medium transition
          ${
            timeLeft > 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-slate-800"
          }
        `}
      >
        {isResending
          ? "Resending..."
          : timeLeft > 0
          ? `Resend email in ${timeLeft}s`
          : "Resend Account Deletion Email"}
      </button>
    </div>
  );
}
