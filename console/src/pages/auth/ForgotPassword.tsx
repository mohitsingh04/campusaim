import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { API } from "../../contexts/API";
import { forgotPasswordSchema } from "../../contexts/ValidationsSchemas";
import { getErrorResponse } from "../../contexts/Callbacks";

export function ForgotPassword() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await API.post("/profile/forgot-password", values);
        toast.success(response.data.message);

        navigate(`/forgot-password/${encodeURIComponent(values.email)}`);
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-5">
        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Enter Your Official Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border ${
              formik.touched.email && formik.errors.email
                ? "border-red-500"
                : "border-gray-200"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 text-sm`}
          />
          {formik.touched.email && formik.errors.email && (
            <p className="text-xs text-red-500 mt-1">{formik.errors.email}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg text-sm"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Submitting..." : "Submit"}
        </button>

        <p className="text-center text-xs text-gray-500">
          Remembered your password?{" "}
          <Link
            to="/"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </form>
  );
}
