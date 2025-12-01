"use client";
import API from "@/contexts/API";
import { getProfile } from "@/contexts/getAssets";
import { UserProps } from "@/types/types";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { BsShield } from "react-icons/bs";
import { LuX } from "react-icons/lu";

interface ConsentModalProps {
  onConsentGiven?: (status: "accepted" | "rejected") => void;
}

export function ConsentModal({ onConsentGiven }: ConsentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfileUser = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      console.log("Error fetching profile:", error);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  const getConsentStatus = useCallback(async () => {
    if (!profile?._id) return;
    try {
      const response = await API.get(`/profile/consent/user/${profile._id}`);
      const userConsent = response?.data?.consent;
      if (userConsent === true) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } catch (error: any) {
      if (error?.response?.status === 404) {
        setIsVisible(true);
      } else {
        console.log("Error fetching consent:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    getConsentStatus();
  }, [getConsentStatus]);

  const setConsentStatus = async (status: "accepted" | "rejected") => {
    if (!profile?._id) return;
    try {
      await API.post(`/profile/consent`, {
        userId: profile._id,
        consent: status === "accepted",
      });
    } catch (error) {
      console.log("Error saving consent:", error);
    }
  };

  const handleClose = () => setIsVisible(false);

  const handleAccept = async () => {
    await setConsentStatus("accepted");
    onConsentGiven?.("accepted");
    handleClose();
  };

  const handleReject = async () => {
    await setConsentStatus("rejected");
    onConsentGiven?.("rejected");
    handleClose();
  };

  if (!isVisible || loading) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:inset-auto md:bottom-0 md:left-0 md:right-0 md:p-0">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
        onClick={handleClose}
      />
      <div
        className="
          bg-white shadow-2xl transform transition-all w-full animate-slide-up
          max-w-md rounded-xl border border-gray-200 md:py-4
          md:max-w-7xl mb-3 md:border-t md:border-x-0 md:border-b-0
          md:shadow-[0_-4px_16px_rgba(0,0,0,0.1)]
          relative z-10 overflow-hidden
        "
      >
        <div className="hidden md:flex md:w-full md:max-w-7xl md:mx-auto md:py-4 md:px-6 md:items-center md:justify-between md:gap-6">
          <div className="flex items-start gap-4 text-sm text-gray-800 flex-1">
            <div className="mt-0.5 flex-shrink-0">
              <BsShield className="h-5 w-5 text-purple-600" />
            </div>
            <p>
              We use cookies to enhance your browsing experience and analyze
              site traffic. By clicking{" "}
              <span className="font-semibold">&quot;Accept All&quot;</span>, you
              consent to our use of cookies.{" "}
              <Link
                href="/privacy"
                className="text-purple-600 hover:text-purple-700 underline underline-offset-2 font-medium transition-colors"
              >
                Learn more
              </Link>
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-5 py-2 border border-gray-300 hover:border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium text-sm"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all text-sm"
            >
              Accept All
            </button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="bg-white px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BsShield className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Cookie Preferences
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LuX className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                We respect your privacy
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                We use cookies and similar technologies to provide you with a
                personalized experience, improve our services, and analyze site
                usage. Your privacy matters to us.
              </p>
            </div>

            <p className="text-xs text-gray-500">
              For more details, please review our{" "}
              <Link
                href="/privacy"
                className="text-purple-600 hover:text-purple-700 underline underline-offset-2 font-medium transition-colors"
              >
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link
                href="/terms"
                className="text-purple-600 hover:text-purple-700 underline underline-offset-2 font-medium transition-colors"
              >
                Terms of Service
              </Link>
              .
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleAccept}
                className="w-full px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Accept All Cookies
              </button>
              <button
                onClick={handleReject}
                className="w-full px-5 py-3 border border-gray-300 hover:border-gray-400 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium"
              >
                Reject All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
