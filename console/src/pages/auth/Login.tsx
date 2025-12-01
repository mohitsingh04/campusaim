import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { API } from "../../contexts/API";
import toast from "react-hot-toast";
import { loginSchema } from "../../contexts/ValidationsSchemas";
import { getErrorResponse } from "../../contexts/Callbacks";

export function Login() {
  const redirector = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await API.post(`/profile/login`, values);
        toast.success(response.data.message);
        redirector(`/dashboard`);
        window.location.reload();
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

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Your Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`w-full px-4 py-3 border ${
              formik.touched.password && formik.errors.password
                ? "border-red-500"
                : "border-gray-200"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-400 pr-12 text-sm`}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {formik.touched.password && formik.errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {formik.errors.password}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="flex justify-end items-center text-xs">
          <Link
            to="/forgot-password"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg text-sm"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Signing In..." : "Sign In"}
        </button>

        <p className="text-center text-xs text-gray-500">
          Trouble Signing in? Connect with your Administrator
        </p>
        <p className="text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Register here
          </Link>
        </p>
      </div>
    </form>
  );
}
