import { useState } from "react";
import { useFormik } from "formik";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  DashboardOutletContextProps,
  PropertyProps,
} from "../../../../types/types";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { API } from "../../../../contexts/API";
import { ReviewValidation } from "../../../../contexts/ValidationsSchemas";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import { phoneInputClass } from "../../../../common/ExtraData";

export default function AddReview({
  property,
  onsubmit,
}: {
  property: PropertyProps | null;
  onsubmit: () => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const { authUser } = useOutletContext<DashboardOutletContextProps>();

  const formik = useFormik({
    initialValues: {
      userId: authUser?._id || "",
      property_id: property?._id || "",
      name: "",
      email: "",
      phone_number: "",
      rating: 0,
      review: "",
    },
    enableReinitialize: true,
    validationSchema: ReviewValidation,
    onSubmit: async (values) => {
      try {
        const response = await API.post(`/review`, values);
        toast.success(response?.data?.message);
        onsubmit();
        formik.resetForm();
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  return (
    <div className="p-4 max-w-full mx-auto">
      <form onSubmit={formik.handleSubmit} className="space-y-4">
        {/* Two fields per row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {getFormikError(formik, "name")}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {getFormikError(formik, "email")}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Phone Number
            </label>
            <PhoneInput
              country={"in"}
              value={formik.values.phone_number}
              onChange={(phone) => formik.setFieldValue("phone_number", phone)}
              inputProps={{
                name: "phone_number",
                onBlur: formik.handleBlur,
                placeholder: "Enter phone number",
              }}
              inputClass={phoneInputClass()?.input}
              buttonClass={phoneInputClass()?.button}
            />
            {getFormikError(formik, "phone_number")}
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Rating
            </label>
            <div className="flex space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={24}
                  className={`cursor-pointer ${
                    (hoverRating || formik.values.rating) >= star
                      ? "fill-[var(--yp-rating)]"
                      : "fill-[var(--yp-rating-sec)]"
                  }`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => formik.setFieldValue("rating", star)}
                />
              ))}
            </div>
            {getFormikError(formik, "rating")}
          </div>
        </div>

        {/* Review */}
        <div className="relative">
          <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
            Review
          </label>
          <textarea
            id="review"
            name="review"
            placeholder="Write your review here..."
            maxLength={1500}
            rows={5}
            className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.review}
          />
          <div className="absolute bottom-2 right-3 text-gray-500 dark:text-gray-400 text-sm">
            {formik.values.review.length}/1500
          </div>
          {getFormikError(formik, "review")}
        </div>

        <button
          type="submit"
          className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
}
