"use client";
import { CouponsProps } from "@/types/types";
import React, { useState } from "react";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaTags,
  FaEye,
  FaRegCopy,
} from "react-icons/fa";

const CouponCard = ({ coupon }: { coupon: CouponsProps }) => {
  const [copied, setCopied] = useState(false);
  const [isview, setIsview] = useState(false);

  const now = new Date();
  const startFrom = new Date(coupon.start_from);
  const validUpto = new Date(coupon.valid_upto);

  const isActive = now >= startFrom && now <= validUpto;

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isActive) return null;

  return (
    <div className="group bg-gray-50 shadow-xs hover:shadow-sm rounded-2xl p-6 space-y-5 relative overflow-hidden transition duration-300">
      {/* Coupon Code Section */}
      <div className="flex items-center justify-between bg-purple-50 border border-purple-300 px-4 py-2 rounded-lg shadow-sm transition duration-300 z-10">
        <div
          className={`text-purple-700 font-mono cursor-pointer text-lg tracking-wider ${
            !isview ? "blur-[3px]" : ""
          }`}
        >
          {coupon.coupon_code}
        </div>

        {isview ? (
          <button
            onClick={handleCopy}
            className="bg-purple-600 text-white px-2 py-2 rounded-md hover:bg-purple-700 transition flex items-center gap-2 text-sm"
          >
            {copied ? (
              <FaCheckCircle className="w-4 h-4" />
            ) : (
              <FaRegCopy className="w-4 h-4" />
            )}
          </button>
        ) : (
          <button
            onClick={() => setIsview(true)}
            className="text-purple-600 text-sm underline hover:text-purple-800 flex items-center gap-1"
          >
            <FaEye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Coupon Meta Info */}
      <div className="flex flex-wrap justify-between gap-3 text-sm">
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1">
          <FaCalendarAlt className="w-4 h-4" />
          Valid until: {validUpto.toLocaleDateString()}
        </span>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold inline-flex items-center gap-1">
          <FaTags className="w-4 h-4" />
          {coupon.discount}% Off
        </span>
      </div>

      {/* Description */}
      <div className="text-gray-700 leading-relaxed text-justify text-sm sm:text-base">
        {coupon.description || "No description provided."}
      </div>
    </div>
  );
};

const CouponsTab = ({ coupons }: { coupons: CouponsProps[] }) => {
  return (
    <div className="px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {coupons?.map((coupon, idx) => (
          <CouponCard key={idx} coupon={coupon} />
        ))}
      </div>
    </div>
  );
};

export default CouponsTab;
