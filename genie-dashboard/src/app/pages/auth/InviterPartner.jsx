import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { User, Mail, AlertCircle, EyeOff, Eye, Lock } from "lucide-react";
import Logo from "../../assets/campusaim/logo/campusaim-logo.png";
import WelcomeImage from "../../assets/images/welcome-image.png";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { API } from "../../services/API";
import InputMask from "react-input-mask";
import { capitalizeWords, trimValue } from '../../utils/format';

export default function InviterPartner() {
    const navigate = useNavigate();
    const { token } = useParams(); // /partner/register/:token
    const [error, setError] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name is required.")
            .matches(/^(?!.*\s{2})[A-Za-z\s]+$/, "Only alphabets & single spaces allowed.")
            .min(2, "Minimum 2 characters"),
        email: Yup.string().email("Invalid email").required("Email is required."),
        contact: Yup.string()
            .required("Contact number is required.")
            .transform((v) => v.replace(/\s/g, ""))
            .matches(/^(\+91|0)?[6-9][0-9]{9}$/, "Enter valid Indian number"),
        password: Yup.string()
            .required("Password is required.")
            .min(6, "Password must be at least 6 characters"),
    });

    const formik = useFormik({
        initialValues: { name: "", email: "", contact: "", password: "" },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            if (!token) {
                toast.error("Invalid or missing invite token");
                return;
            }

            const toastId = toast.loading("Creating your partner account...");
            try {
                const cleanedContact = values.contact.replace(/\s/g, "");

                const res = await API.post(`/auth/partner/register/${token}`, {
                    name: values.name.trim(),
                    email: values.email.trim().toLowerCase(),
                    contact: cleanedContact,
                    password: values.password,
                });

                toast.success(res.data?.message || "Registered successfully", { id: toastId });
                navigate("/");
            } catch (err) {
                const msg =
                    err.response?.data?.error ||
                    "Registration failed. Please try again.";
                setError(msg);
                toast.error(msg, { id: toastId });
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex">
            {/* Left Branding */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 text-white flex-col justify-center items-center p-12">
                <img src={Logo} alt="logo" className="h-16 mb-6" />
                <h1 className="text-3xl font-bold mb-4">Partner Onboarding</h1>
                <p className="text-lg text-blue-100 text-center max-w-md">
                    Join the organization as a partner using your secure invite link.
                </p>
                <img
                    src={WelcomeImage}
                    alt="Illustration"
                    className="mt-10 w-3/4 max-w-md drop-shadow-lg"
                />
            </div>

            {/* Right Form */}
            <div className="flex w-full lg:w-1/2 justify-center items-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            Register as Partner
                        </h2>
                        <p className="text-gray-500 text-sm mt-2">
                            Complete your details to activate your partner account
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={formik.handleSubmit}>
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
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
                            {formik.touched.name && formik.errors.name && (
                                <small className="text-red-500">{formik.errors.name}</small>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
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
                            {formik.touched.email && formik.errors.email && (
                                <small className="text-red-500">{formik.errors.email}</small>
                            )}
                        </div>

                        {/* Contact */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact No.
                            </label>
                            <div className="relative flex rounded-lg shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-700 text-sm">
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
                                            placeholder="Enter your number"
                                            className={`w-full pr-4 py-2.5 ps-3 border rounded-r-lg text-sm focus:ring-2 focus:ring-blue-500 ${formik.touched.contact && formik.errors.contact
                                                ? "border-red-500"
                                                : "border-gray-300"
                                                }`}
                                        />
                                    )}
                                </InputMask>
                            </div>
                            {formik.touched.contact && formik.errors.contact && (
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

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                    <span className="text-sm text-red-700">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={!isChecked || formik.isSubmitting}
                            className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50"
                        >
                            {formik.isSubmitting ? "Submitting..." : "Register as Partner"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}