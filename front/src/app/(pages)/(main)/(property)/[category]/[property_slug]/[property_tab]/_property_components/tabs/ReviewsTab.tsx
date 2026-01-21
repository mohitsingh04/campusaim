"use client";

import { PropertyProps } from "@/types/PropertyTypes";
import { useState } from "react";
import { LuStar, LuUser } from "react-icons/lu";
import ReviewForm from "./ReviewForm";
import { getAverageRating, getRatingDistribution } from "@/context/Callbacks";
import ReadMoreLessNoBlur from "@/ui/texts/ReadMoreLessNoBlur";
import { UserProps } from "@/types/UserTypes";

export default function ReviewsTab({
  property,
  getProperty,
  profile,
}: {
  property: PropertyProps | null;
  getProperty: () => void;
  profile: UserProps | null;
}) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const safeReviews = Array.isArray(property?.reviews) ? property.reviews : [];
  const rating = getAverageRating(safeReviews);
  const ratingDistribution = getRatingDistribution(safeReviews);

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <LuStar
          key={index}
          className={`w-5 h-5 transition-colors ${
            rating > index
              ? "text-(--warning) fill-(--warning)"
              : "text-(--text-color)"
          }`}
        />
      ));
  };

  return (
    <div className="p-4 mt-6 text-(--text-color)">
      {!showReviewForm && (
        <div className=" p-6 flex justify-between items-center">
          <div>
            <h3 className="text-4xl font-bold">{rating}</h3>
            <div className="flex mt-2 ">{renderStars(Number(rating))}</div>
            <p className="mt-2">Based on {safeReviews?.length || 0} reviews</p>
          </div>

          <div className="space-y-2 w-1/2">
            {[5, 4, 3, 2, 1].map((star) => {
              const percentage = ratingDistribution[star - 1];
              return (
                <div key={star} className="flex items-center">
                  <span className="w-6">{star}</span>
                  <LuStar
                    className="w-5 h-5 text-(--warning) ml-1"
                    fill="currentColor"
                  />
                  <div className="w-full bg-(--border) h-2 rounded ml-2">
                    <div
                      className="h-2 bg-(--warning) rounded"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex justify-center mt-6">
        {showReviewForm ? (
          <button
            onClick={() => setShowReviewForm(false)}
            className="btn-shine px-4 py-2 rounded-custom"
          >
            Cancel Review
          </button>
        ) : (
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn-shine px-4 py-2 rounded-custom"
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm ? (
        <ReviewForm
          property={property}
          onSave={getProperty}
          profile={profile}
        />
      ) : (
        <div className="space-y-6 mt-6">
          {safeReviews.map((review, index) => (
            <div
              key={index}
              className="bg-(--secondary-bg) rounded-custom shadow-custom p-6"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className="w-14 h-14 bg-(--main-light) shadow-custom rounded-full flex items-center justify-center">
                    <LuUser className="w-7 h-7 text-(--main-emphasis)" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize text-(--text-color-emphasis) text-lg">
                      {review.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(review?.rating || 0)}
                  </div>
                  <ReadMoreLessNoBlur html={review?.review || ""} limit={30} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
