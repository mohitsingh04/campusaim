import { PropertyProps, ReviewProps, UserProps } from "@/types/types";
import React, { useEffect, useState } from "react";
import { LuStar, LuUser } from "react-icons/lu";
import ReviewForm from "./ReviewComponent/ReviewForm";
import { getProfile } from "@/contexts/getAssets";
import { NonLoginModal } from "@/components/modals/NonLoginModal";

const getAverageRating = (reviews: ReviewProps[]): string => {
  if (!reviews || reviews.length === 0) return "0.0";
  const sum = reviews.reduce((acc, review) => acc + (review?.rating || 0), 0);
  return (sum / reviews.length).toFixed(1);
};

const getRatingDistribution = (reviews: ReviewProps[]) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return [0, 0, 0, 0, 0];
  }

  const total = reviews.length;
  const distribution = [0, 0, 0, 0, 0];

  reviews.forEach((review) => {
    if ((review?.rating || 0) >= 1 && (review?.rating || 0) <= 5) {
      distribution[(review?.rating || 0) - 1]++;
    }
  });

  return distribution.map((count) =>
    total > 0 ? Math.round((count / total) * 100) : 0
  );
};

const ReviewsTab = ({
  property,
  getProperty,
}: {
  property: PropertyProps | null;
  getProperty: (propertyId: number) => void;
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState<{
    [key: number]: boolean;
  }>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authuser, setAuthUser] = useState<UserProps | null>();
  const [authLoading, setAuthLoading] = useState(true);

  // Load user token
  useEffect(() => {
    const getUserDetails = async () => {
      setAuthLoading(true);
      const token = await getProfile();
      setAuthUser(token);
      setAuthLoading(false);
    };
    getUserDetails();
  }, []);

  // Ensure we have a valid array of reviews
  const safeReviews = Array.isArray(property?.reviews) ? property.reviews : [];
  const rating = getAverageRating(safeReviews);
  const ratingDistribution = getRatingDistribution(safeReviews);

  const toggleReadMore = (index: number) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <LuStar
          key={index}
          className={`w-5 h-5 transition-colors ${
            rating > index ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ));
  };

  const onSubmit = async () => {
    await getProperty(property?.uniqueId || 0);
    setShowReviewForm(false);
  };

  return (
    <div className="space-y-8 p-4">
      <div className="rounded-2xl p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {rating}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
              {renderStars(Number(rating))}
            </div>
            <p className="text-gray-600 text-lg">
              Based on {safeReviews.length} reviews
            </p>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const percentage = ratingDistribution[stars - 1];
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{stars}</span>
                  <LuStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="text-center mb-8">
        {!authLoading && authuser ? (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-purple-600 text-white px-8 py-3 cursor-pointer rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow"
          >
            {showReviewForm ? "Cancel Review" : "Write a Review"}
          </button>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-purple-600 text-white px-8 py-3 cursor-pointer rounded-xl hover:bg-purple-700 transition-all duration-300 transform hover:scale-105 font-medium shadow"
          >
            Write a Review
          </button>
        )}
      </div>
      {showLoginModal && (
        <NonLoginModal closeModal={() => setShowLoginModal(false)} />
      )}

      {showReviewForm ? (
        <ReviewForm property={property} onSubmit={onSubmit} />
      ) : safeReviews.length > 0 ? (
        <div className="space-y-6">
          {safeReviews.map((review, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl shadow-xs p-6 hover:shadow-sm transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-purple-100 shadow-xs rounded-full flex items-center justify-center">
                    <LuUser className="w-7 h-7 text-purple-600" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize text-gray-900 text-lg">
                      {review.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(review?.rating || 0)}
                  </div>
                  {(() => {
                    const words = review?.review?.split(" ") || [];
                    const isLong = words.length > 30;
                    const isExpanded = expandedReviews[index];

                    return (
                      <>
                        <p className="text-gray-700 leading-relaxed">
                          {isLong && !isExpanded
                            ? words.slice(0, 30).join(" ") + "..."
                            : review.review}
                        </p>
                        {isLong && (
                          <button
                            className="text-purple-600 font-medium mt-2 hover:underline"
                            onClick={() => toggleReadMore(index)}
                          >
                            {isExpanded ? "Show less" : "Read more"}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuStar className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No reviews yet
          </h3>
          <p className="text-gray-500">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
