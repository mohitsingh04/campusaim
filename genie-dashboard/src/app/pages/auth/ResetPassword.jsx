import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Lock, AlertCircle, EyeOff, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { API } from '../../services/API';
import Logo from "../../assets/campusaim/logo/campusaim-logo.png";

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const initialValues = {
        password: '',
        confirmPassword: '',
    };

    const validationSchema = Yup.object({
        password: Yup.string().min(6, 'At least 6 characters').required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Confirm your password'),
    });

    const handleSubmit = async (values) => {
        const toastId = toast.loading("Resetting...");
        setError("");
        try {
            const res = await API.post('/reset-password', {
                token,
                password: values.password,
                confirmPassword: values.confirmPassword,
            });

            toast.success(res.data.message || "Password reset successful", { id: toastId });
            navigate("/");
        } catch (err) {
            toast.dismiss(toastId);

            const message = err.response?.data?.error;

            if (message?.toLowerCase().includes("expired") || message?.toLowerCase().includes("invalid")) {
                setError("Your reset link has expired. Please request a new one.");
            } else {
                setError(message || "Something went wrong.");
            }
        }
    };


    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: handleSubmit
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <img src={Logo} alt="logo" className="non-auth-logo" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                        <p className="text-gray-600 mt-2">Set a new password for your account</p>
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

                    {/* Form */}
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter new password"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
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
                                <small className="text-red-500 text-sm mt-1 block">{formik.errors.password}</small>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm new password"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                <small className="text-red-500 text-sm mt-1 block">{formik.errors.confirmPassword}</small>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
