import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { Eye, Mail, Lock, AlertCircle, EyeOff } from 'lucide-react';
import Logo from "../../assets/campusaim/logo/campusaim-logo.png";
import WelcomeImage from "../../assets/images/welcome-image.png";
import { API } from '../../services/API';
import Loader from '../../common/Loader/Loader';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';

const LoginForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email is required."),
    password: Yup.string().required("Password is required."),
  });

  const initialValues = {
    email: "",
    password: ""
  };

  const handleSubmit = async (values) => {
    const toastId = toast.loading("Logging in...");
    setIsLoading(true);

    try {
      const response = await API.post("/login", values, {
        withCredentials: true
      });

      toast.success(response.data.message || "Login successful", { id: toastId });

      navigate("/dashboard");
      navigate(0);

    } catch (error) {
      const errorMessage = error.response?.data?.error || "Something went wrong.";

      toast.dismiss(toastId);

      // handle email verification redirect
      if (errorMessage.includes("Email not verified")) {
        navigate(`/verify-email?email=${values.email}`);
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 text-white flex-col justify-center items-center p-12">
        <img src={Logo} alt="logo" className="h-16 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
        <p className="text-lg text-blue-100 text-center max-w-md">
          Log in to continue managing your students, leads, and progress on your LMS.
        </p>
        <img
          src={WelcomeImage}
          alt="Login Illustration"
          className="mt-10 w-3/4 max-w-md drop-shadow-lg"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Login to your account</h2>
            <p className="text-gray-500 text-sm mt-2">Access your LMS dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().trim();
                    formik.setFieldValue("email", value);
                  }}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${formik.touched.email && formik.errors.email ? "border-red-500" : ""
                    }`}
                />
              </div>

              {formik.errors.email && formik.touched.email && (
                <small className="text-red-500">{formik.errors.email}</small>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className={`w-full pl-10 pr-10 py-2.5 border ${formik.errors.password && formik.touched.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <small className="text-red-500">{formik.errors.password}</small>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-blue-600 text-sm hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Logging in..." : "Login"}
            </button>
            <GoogleAuthButton />

            {/* Link to Register */}
            {/* <div className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </div> */}
            <div className="text-center text-sm text-gray-600">
              Become a Partner?{" "}
              <Link to="/become-a-partner" className="text-blue-600 hover:underline">
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
