import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, User } from 'lucide-react';
import Logo from "../../assets/campusaim/logo/campusaim-logo.png";
import WelcomeImage from "../../assets/images/welcome-image.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { API } from '../../services/API';
import InputMask from 'react-input-mask';
import GoogleAuthButton from '../../components/GoogleAuthButton/GoogleAuthButton';
import { capitalizeWords, trimValue } from '../../utils/format';

const RegisterForm = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name is required.")
            .matches(/^(?!.*\s{2})[A-Za-z\s]+$/, "Name can contain only alphabets and single spaces.")
            .min(2, "Name must contain atleast 2 characters")
            .trim(),
        email: Yup.string()
            .email("Invalid email")
            .required("Email is required."),
        contact: Yup.string()
            .required("Contact number is required.")
            .transform(value => value.replace(/\s/g, ""))
            .matches(/^(\+91|0)?[6-9][0-9]{9}$/, "Please enter a valid Indian contact number"),
        password: Yup.string()
            .required("Password is required.")
            .min(6, "Password must be at least 6 characters"),
    });

    const initialValues = {
        name: "",
        email: "",
        contact: "",
        password: ""
    }

    const handleSubmit = async (values) => {
        const toastId = toast.loading("Registering...");
        const cleanedContact = values.contact.replace(/\s/g, "");

        try {
            const response = await API.post("/register", {
                name: values.name,
                email: values.email,
                contact: cleanedContact,
                password: values.password,
            });

            toast.success(
                response.data.message || "Registered successfully!",
                { id: toastId }
            );

            setError("");

            // ✅ redirect to check-email page
            navigate(`/verify-email?email=${values.email}`);
        } catch (error) {
            const errorMessage =
                error.response?.data?.error ||
                "Something went wrong. Please try again.";

            setError(errorMessage);
            toast.error(errorMessage, { id: toastId });
        }
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit
    });

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 text-white flex-col justify-center items-center p-12">
                <img src={Logo} alt="logo" className="h-16 mb-6" />
                <h1 className="text-3xl font-bold mb-4">Welcome to Your LMS</h1>
                <p className="text-lg text-blue-100 text-center max-w-md">
                    Manage students, track progress, and streamline your learning journey with ease.
                </p>
                <img
                    src={WelcomeImage}
                    alt="Illustration"
                    className="mt-10 w-3/4 max-w-md drop-shadow-lg"
                />
            </div>

            {/* Right Side - Form */}
            <div className="flex w-full lg:w-1/2 justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-semibold text-gray-800">Create your account</h2>
                        <p className="text-gray-500 text-sm mt-2">Register to access your LMS dashboard</p>
                    </div>

                    {/* Form (your form code goes here) */}
                    {/* Form */}
                    <form className="space-y-5" onSubmit={formik.handleSubmit}>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formik.values.name}
                                    onChange={(e) => {
                                        formik.setFieldValue("name", capitalizeWords(e.target.value));
                                    }}
                                    onBlur={(e) => {
                                        formik.setFieldValue("name", trimValue(e.target.value));
                                        formik.handleBlur(e);
                                    }}
                                    className={`w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${formik.touched.name && formik.errors.name ? "border-red-500" : ""
                                        }`}
                                />
                            </div>
                            {formik.errors.name && formik.touched.name && (
                                <small className="text-red-500">{formik.errors.name}</small>
                            )}
                        </div>

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

                        {/* Contact */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
                            <div className="relative flex rounded-lg shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm select-none">
                                    +91
                                </span>
                                <InputMask
                                    mask="99999 99999"
                                    maskChar=""
                                    name="contact"
                                    value={formik.values.contact}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                >
                                    {(inputProps) => (
                                        <input
                                            {...inputProps}
                                            type="text"
                                            className={`w-full pr-4 py-2.5 ps-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${formik.touched.contact && formik.errors.contact ? 'border-red-500' : ''}`}
                                            placeholder="Enter your number"
                                        />
                                    )}
                                </InputMask>
                            </div>
                            {formik.errors.contact && formik.touched.contact && (
                                <small className="text-red-500">{formik.errors.contact}</small>
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
                                    className={`w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''}`}
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
                            {formik.errors.password && formik.touched.password && (
                                <small className="text-red-500">{formik.errors.password}</small>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-center gap-2">
                            <input
                                id="terms"
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                                className="cursor-pointer"
                            />

                            <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                                I agree to the
                                <Link
                                    to="/"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-blue-600 hover:underline ml-1"
                                >
                                    terms & conditions
                                </Link>
                            </label>
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

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
                            disabled={!isChecked || formik.isSubmitting}
                        >
                            {formik.isSubmitting ? "Registering..." : "Register"}
                        </button>
                        <GoogleAuthButton />

                        {/* Link */}
                        <div className="text-center text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link to="/" className="text-blue-600 hover:underline">
                                Log in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
};

export default RegisterForm;
