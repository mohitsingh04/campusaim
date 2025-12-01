import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { ResetPasswordValidation } from "../../contexts/ValidationsSchemas";
import { getErrorResponse } from "../../contexts/Callbacks";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await API.get(`/profile/reset/${token}`);
        toast.success(response?.data?.message || "Token verified!");
      } catch (error) {
        getErrorResponse(error);
        navigate("/");
      }
    };
    verifyToken();
  }, [token, navigate]);

  const formik = useFormik({
    initialValues: {
      new_password: "",
      confirm_password: "",
      token,
    },
    validationSchema: ResetPasswordValidation,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await API.post("/profile/reset", values);
        toast.success(response.data.message || "Password reset successfully!");
        navigate("/");
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <>
      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* New Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="new_password"
            placeholder="New Password"
            value={formik.values.new_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border ${
              formik.touched.new_password && formik.errors.new_password
                ? "border-red-500"
                : "border-gray-200"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 pr-12 text-sm`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {formik.touched.new_password && formik.errors.new_password && (
            <p className="text-xs text-red-500 mt-1">
              {formik.errors.new_password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirm_password"
            placeholder="Confirm Password"
            value={formik.values.confirm_password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border ${
              formik.touched.confirm_password && formik.errors.confirm_password
                ? "border-red-500"
                : "border-gray-200"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 pr-12 text-sm`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {formik.touched.confirm_password &&
            formik.errors.confirm_password && (
              <p className="text-xs text-red-500 mt-1">
                {formik.errors.confirm_password}
              </p>
            )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg text-sm"
        >
          {formik.isSubmitting ? "Resetting..." : "Reset Password"}
        </button>

        {/* Extra info */}
        <p className="text-center text-xs text-gray-500 mt-2">
          Remembered your password?{" "}
          <span
            className="text-blue-500 hover:text-blue-600 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </form>
    </>
  );
}
