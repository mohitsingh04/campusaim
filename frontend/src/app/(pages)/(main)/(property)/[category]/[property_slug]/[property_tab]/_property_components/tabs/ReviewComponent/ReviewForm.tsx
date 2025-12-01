import React, { useState } from "react";
import { LuMessagesSquare, LuSend } from "react-icons/lu";
import { useFormik } from "formik";
import PhoneInput from "react-phone-input-2";
import API from "@/contexts/API";
import { PropertyProps } from "@/types/types";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ReviewValidation } from "@/contexts/ValidationSchema";
import { FaRegUser, FaStar } from "react-icons/fa";
import { MdOutlineMail } from "react-icons/md";

const ReviewForm = ({
  property,
  onSubmit,
}: {
  property: PropertyProps | null;
  onSubmit: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);

  const formik = useFormik({
    initialValues: {
      property_id: property?.uniqueId || "",
      name: "",
      email: "",
      phone: "",
      review: "",
    },
    enableReinitialize: true,
    validationSchema: ReviewValidation,
    onSubmit: async (values, { resetForm }) => {
      if (rating === 0) {
        toast.error("Please select at least 1 star rating.");
        return;
      }
      setIsSubmitting(true);

      const payload = {
        ...values,
        rating,
      };

      try {
        const response = await API.post(`/review`, payload);
        toast.success(response?.data?.message);
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        toast.error(err.response?.data?.message || "Something went wrong.");
      } finally {
        setIsSubmitting(false);
        resetForm();
        setRating(0);
        onSubmit();
      }
    },
  });

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-8 h-8 cursor-pointer transition-colors drop-shadow-xs ${
          i < rating
            ? "fill-yellow-400 text-yellow-400 "
            : "text-gray-200 hover:text-yellow-400"
        }`}
        onClick={() => setRating(i + 1)}
      />
    ));
  };

  return (
    <div className="px-4">
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <FaRegUser className="absolute left-3 top-4 text-gray-400" />
            <input
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className={`!w-full !pl-10 !pr-4 !py-3 !bg-gray-50/50 !rounded-xl ${
                formik.touched.name && formik.errors.name
                  ? "!shadow-red-300 !shadow-xs"
                  : "!shadow-sm"
              }`}
              placeholder="Enter your name"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          <div className="relative">
            <MdOutlineMail className="absolute left-3 top-4 text-gray-400" />
            <input
              name="email"
              type="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`!w-full !pl-10 !pr-4 !py-3 !bg-gray-50/50 !rounded-xl ${
                formik.touched.email && formik.errors.email
                  ? "!shadow-red-300 !shadow-xs"
                  : "!shadow-sm"
              }`}
              placeholder="Enter your email"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <PhoneInput
              country={"in"}
              enableSearch
              value={formik.values.phone}
              onChange={(phone) => formik.setFieldValue("phone", phone)}
              onBlur={formik.handleBlur}
              inputProps={{
                name: "phone",
                required: true,
                onBlur: formik.handleBlur,
                placeholder: "Enter your Phone Number",
                className:
                  "!w-full !pl-10 !pr-4 !py-4 !shadow-sm !bg-gray-50/50 !rounded-xl",
              }}
              buttonClass="!bg-gray-50/50 !border-0 !border-e-1 !border-gray-200"
              dropdownClass="!shadow-sm !rounded-md"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-1">
            {renderStars()}
          </div>
        </div>

        <div className="relative">
          <LuMessagesSquare className="absolute left-3 top-4 text-gray-400" />
          <textarea
            name="review"
            rows={3}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.review}
            className={`!w-full !pl-10 !pr-4 !py-3 !bg-gray-50/50 !rounded-xl ${
              formik.touched.review && formik.errors.review
                ? "!shadow-red-300 !shadow-xs"
                : "!shadow-sm"
            }`}
            placeholder="Share your detailed experience..."
          />
          {formik.touched.review && formik.errors.review && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.review}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting Review...
            </>
          ) : (
            <>
              <LuSend className="w-5 h-5" />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
