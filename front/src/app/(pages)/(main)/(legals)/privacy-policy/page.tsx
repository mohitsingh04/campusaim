"use client";
import React, { useCallback, useEffect, useState } from "react";
import { LuLock } from "react-icons/lu";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import Loading from "@/ui/loader/Loading";

const PrivacyPolicy = () => {
  const [privacy, setPrivacy] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getTerms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get(`/legal`);
      setPrivacy(response.data.privacyPolicy);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTerms();
  }, [getTerms]);

  if (loading) return <Loading />;

  return (
    <div className="bg-(--secondary-bg)">
      {privacy ? (
        // Render actual Privacy Policy
        <div
          id="blog-main"
          className="px-4 sm:px-6 lg:px-8 py-8 text-(--text-color)!"
          dangerouslySetInnerHTML={{ __html: privacy }}
        />
      ) : (
        // Fallback (Policy Coming Soon)
        <div className="grow px-6 py-16 flex flex-col items-center justify-center text-center">
          <LuLock size={80} className="text-(--main) mb-6" />
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-(--main)">
            Policy Coming Soon
          </h2>
          <p className="text-(--text-color) max-w-xl">
            We&apos;re currently working hard to prepare this policy for you.
            Please check back soon. Once the policy is available, you’ll receive
            an email notification to stay informed.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;
