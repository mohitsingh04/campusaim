"use client";
import React, { useCallback, useEffect, useState } from "react";
import { LuLock } from "react-icons/lu";
import Breadcrumb from "@/components/breadcrumbs/breadcrumbs";
import API from "@/contexts/API";

const Disclaimers = () => {
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getTerms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get(`/legal`);
      setDisclaimer(response.data.disclaimer);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getTerms();
  }, [getTerms]);

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "Disclaimer" }]} />
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ) : disclaimer ? (
        // Render Disclaimer Policy
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 prose prose-purple"
          dangerouslySetInnerHTML={{ __html: disclaimer }}
        />
      ) : (
        // Fallback (Policy Coming Soon)
        <div className="flex-grow px-6 py-16 flex flex-col items-center justify-center text-center bg-gradient-to-br from-white to-purple-50">
          <LuLock size={80} className="text-purple-600 mb-6" />
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-purple-900">
            Policy Coming Soon
          </h2>
          <p className="text-gray-600 max-w-xl">
            We&apos;re currently working hard to prepare this policy for you.
            Please check back soon. Once the policy is available, you’ll receive
            an email notification to stay informed.
          </p>
        </div>
      )}
    </div>
  );
};

export default Disclaimers;
