"use client";

import { formatDate, isDateActive } from "@/context/Callbacks";
import { PropertyCouponsProps } from "@/types/PropertyTypes";
import ReadMoreLessNoBlur from "@/ui/texts/ReadMoreLessNoBlur";
import { useState } from "react";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaTags,
  FaEye,
  FaRegCopy,
} from "react-icons/fa";

const CouponCard = ({ coupon }: { coupon: PropertyCouponsProps }) => {
  const [copied, setCopied] = useState(false);
  const [isview, setIsview] = useState(false);

  const isActive = isDateActive(coupon.start_from, coupon.valid_upto);

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.coupon_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isActive) return null;

  return (
    <div className="group bg-(--secondary-bg) shadow-xs hover:shadow-sm rounded-2xl p-6 space-y-5 relative overflow-hidden transition duration-300">
      {/* Coupon Code Section */}
      <div className="flex items-center justify-between bg-(--primary-bg) px-4 py-2 rounded-lg shadow-sm transition duration-300 z-10">
        <div
          className={`text-(--main) text-lg tracking-wider ${
            !isview
              ? "blur-[3px] select-none pointer-events-none"
              : "select-text pointer-events-auto"
          }`}
        >
          {coupon.coupon_code}
        </div>

        {isview ? (
          <button
            onClick={handleCopy}
            className="bg-(--secondary-bg) text-(--main) px-2 py-2 rounded-md transition flex items-center gap-2 text-sm"
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
            className="text-(--main) text-sm underline flex items-center gap-1"
          >
            <FaEye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Coupon Meta Info */}
      <div className="flex flex-wrap gap-4 text-sm text-(--text-color)">
        <div className="flex items-center gap-1">
          <FaCalendarAlt className="w-3 h-3" />
          <p>Valid until: {formatDate(coupon?.valid_upto || "")}</p>
        </div>
        <div className="flex items-center gap-1">
          <FaTags className="w-3 h-3" />
          <p>Discount: {coupon.discount}% Off</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-(--text-color)">
        <ReadMoreLessNoBlur html={coupon.description} limit={30} />
      </p>
    </div>
  );
};

const CouponsTab = ({ coupons }: { coupons: PropertyCouponsProps[] }) => {
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
