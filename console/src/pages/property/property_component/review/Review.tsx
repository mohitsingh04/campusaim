import AddReview from "./AddReview";
import {
  DashboardOutletContextProps,
  PropertyProps,
  ReviewProps,
} from "../../../../types/types";
import { useCallback, useEffect, useState } from "react";
import { API } from "../../../../contexts/API";
import { Star, Trash2, User } from "lucide-react";
import swal from "sweetalert2";
import toast from "react-hot-toast";
import {
  getAverageRating,
  getErrorResponse,
} from "../../../../contexts/Callbacks";
import { useOutletContext } from "react-router-dom";
import TableButton from "../../../../ui/button/TableButton";
import ReadMoreLess from "../../../../ui/read-more/ReadMoreLess";

interface ReviewType {
  name: string;
  email?: string;
  phone_number?: string;
  rating: number;
  review: string;
  _id: string;
}

export default function Review({
  property,
}: {
  property: PropertyProps | null;
}) {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const { authUser } = useOutletContext<DashboardOutletContextProps>();

  const getReview = useCallback(async () => {
    if (!property?._id) return;
    try {
      const response = await API.get(`/review/property/${property?._id}`);
      setReviews(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [property?._id]);

  useEffect(() => {
    getReview();
  }, [getReview]);

  const deleteReview = async (_id: string) => {
    const result = await swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const response = await API.delete(`/review/${_id}`);
        setReviews(reviews.filter((r) => r?._id !== _id));
        toast.success(response.data.message || "Review deleted successfully");
      } catch (error) {
        getErrorResponse(error);
      }
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          className={`w-4 h-4 ${
            i <= rating
              ? "fill-[var(--yp-rating)] text-[var(--yp-rating)]"
              : "fill-[var(--yp-border-primary)] text-[var(--yp-border-primary)]"
          } `}
        />
      );
    }
    return stars;
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

  const [showReviewForm, setShowReviewForm] = useState(false);
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const rating = getAverageRating(safeReviews);
  const ratingDistribution = getRatingDistribution(safeReviews);

  return (
    <div className="space-y-8 p-4">
      {/* Rating Summary */}
      <div className="rounded-2xl p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-[var(--yp-text-primary)] mb-2">
              {rating}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
              {renderStars(Number(rating))}
            </div>
            <p className="text-[var(--yp-muted)] text-lg">
              Based on {safeReviews.length} reviews
            </p>
          </div>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((stars) => {
              const percentage = ratingDistribution[stars - 1];
              return (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--yp-muted)] w-8">
                    {stars}
                  </span>
                  <Star className="w-4 h-4 fill-[var(--yp-rating)] text-[var(--yp-rating)]" />
                  <div className="flex-1 bg-[var(--yp-tertiary)] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[var(--yp-rating)] to-[var(--yp-yellow-bg)] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-[var(--yp-muted)] w-12">
                    {percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Form Button */}
      {authUser?.role !== "Property Manager" && authUser?.role !== "User" && (
        <div className="text-center mb-8">
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-[var(--yp-tertiary)] text-[var(--yp-text-primary)] px-8 py-3 bg-blue-300 cursor-pointer rounded-xl"
          >
            {showReviewForm ? "Cancel Review" : "Write a Review"}
          </button>
        </div>
      )}

      {/* Add Review Form */}
      {showReviewForm ? (
        authUser?.role !== "Property Manager" &&
        authUser?.role !== "User" && (
          <AddReview property={property} onsubmit={getReview} />
        )
      ) : safeReviews?.length > 0 ? (
        <div className="space-y-6">
          {safeReviews.map((review, index) => (
            <div
              key={index}
              className="bg-[var(--yp-secondary)] rounded-2xl shadow-xs p-6 hover:shadow-sm transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-[var(--yp-primary)] shadow-sm rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-[var(--yp-text-primary)]" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold capitalize text-[var(--yp-text-primary)] text-lg">
                      {review.name}
                    </h3>

                    {authUser?.role !== "Property Manager" &&
                      authUser?.role !== "User" && (
                        <TableButton
                          Icon={Trash2}
                          color="red"
                          onClick={() => deleteReview(review?._id)}
                        />
                      )}
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(review?.rating || 0)}
                  </div>
                  <ReadMoreLess children={review?.review} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-[var(--yp-tertiary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-12 h-12 text-[var(--yp-muted)]" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--yp-text-primary)] mb-2">
            No reviews yet
          </h3>
          <p className="text-[var(--yp-muted)]">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
}
