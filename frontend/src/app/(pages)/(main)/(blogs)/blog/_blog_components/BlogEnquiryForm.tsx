import React from "react";
import { useFormik } from "formik";
import PhoneInput from "react-phone-input-2";
import { LuCircleCheck, LuMail, LuSend } from "react-icons/lu";
import API from "@/contexts/API";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { BlogsProps } from "@/types/types";
import { BlogEnquiryValidation } from "@/contexts/ValidationSchema";

const BlogEnquiryForm = ({ blog }: { blog: BlogsProps | null }) => {
  const [submitted, setSubmitted] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      mobile_no: "",
      message: "",
      blogId: blog?.uniqueId || "",
    },
    enableReinitialize: true,
    validationSchema: BlogEnquiryValidation,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const response = await API.post(`/blog/create/enquiry`, values);
        toast.success(response.data.message);
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        toast.error(err.response?.data?.error || "Something went wrong.");
      } finally {
        setSubmitting(false);
        setSubmitted(true);
        resetForm();
      }
    },
  });

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm mt-8 p-6">
        <div className="from-green-50 to-emerald-50 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuCircleCheck className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your enquiry has been submitted successfully. We’ll get back to you
            shortly.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="text-purple-600 font-medium hover:text-purple-700 transition-colors bg-white px-6 py-2 rounded-lg shadow-sm hover:shadow-md"
          >
            Send Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm mt-8 p-6">
      <div className="rounded-2xl p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Send Enquiry
          </h3>
        </div>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 gap-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.name}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder="Enter your full name"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <div className="relative">
              <LuMail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl"
                placeholder="you@example.com"
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contact Number *
            </label>
            <PhoneInput
              country={"in"}
              value={formik.values.mobile_no}
              onChange={(value) => formik.setFieldValue("mobile_no", value)}
              inputProps={{
                name: "mobile_no",
                required: true,
              }}
              inputStyle={{
                width: "100%",
                paddingTop: "24px",
                paddingBottom: "24px",
                paddingLeft: "48px",
                borderRadius: "0.75rem",
                borderColor: "#d1d5db",
                fontSize: "1rem",
              }}
              buttonStyle={{
                borderColor: "#d1d5db",
                backgroundColor: "white",
                paddingTop: "12px",
                paddingBottom: "12px",
                borderTopLeftRadius: "0.75rem",
                borderBottomLeftRadius: "0.75rem",
              }}
              containerStyle={{ width: "100%" }}
            />
            {formik.touched.mobile_no && formik.errors.mobile_no && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.mobile_no}
              </p>
            )}
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              onChange={formik.handleChange}
              value={formik.values.message}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              placeholder="Write your message here"
              rows={4}
            />
            {formik.touched.message && formik.errors.message && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2"
            >
              {formik.isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <LuSend className="w-5 h-5" />
                  Send Enquiry
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogEnquiryForm;
