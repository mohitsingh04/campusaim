import React, { useState } from 'react';
import { Mail, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from "../../assets/campusaim/logo/campusaim-logo.png";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { API } from '../../services/API';

const ForgotPasswordForm = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const initialValues = {
        email: '',
    }

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
    })

    const handleSubmit = async (values) => {
        const toastId = toast.loading("Sending reset link...");
        try {
            const response = await API.post('/forgot-password', { email: values.email });

            toast.success(response.data.message || "Reset link sent successfully", { id: toastId });
            setError("");
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Something went wrong. Please try again.";
            setError(errorMessage);
            toast.dismiss(toastId);
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: handleSubmit,
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
                        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                        <p className="text-gray-600 mt-2">Enter your email to reset your password</p>
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

                    {/* Forgot Password Form */}
                    <form className="space-y-6" onSubmit={formik.handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    name="email"
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter your email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                />
                            </div>
                            {formik.touched.email && formik.errors.email && (
                                <small className="text-red-500 text-sm mt-1 block">{formik.errors.email}</small>
                            )}
                        </div>


                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={formik.isSubmitting}
                        >
                            {formik.isSubmitting ? "Sending..." : "Send Reset Link"}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            Remember your password?{" "}
                            <Link to="/" className="text-blue-600 hover:underline">
                                Login
                            </Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;
