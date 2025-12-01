import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { LuArrowRight, LuRefreshCcw } from "react-icons/lu";

interface OtpInputProps {
  type: "email" | "mobile";
  matchOTP: (otp: string) => void;
  resendOtp: () => void;
}

export default function OtpInput({ type, matchOTP, resendOtp }: OtpInputProps) {
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(0);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      otp: "",
    },
    validationSchema: Yup.object({
      otp: Yup.string()
        .required("OTP is required")
        .length(6, "OTP must be exactly 6 digits")
        .matches(/^\d+$/, "OTP must be numeric"),
    }),
    onSubmit: (values) => {
      matchOTP(values.otp);
    },
  });

  // Resend OTP handler
  const handleResend = async () => {
    if (timer > 0) return;

    setIsResending(true);
    await resendOtp();

    // Reset after short delay
    setTimeout(() => {
      setIsResending(false);
      formik.resetForm();
      setTimer(300); // 5 minutes = 300 seconds
    }, 800);
  };

  // Countdown timer effect
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Format timer (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Enter Verification Code
        </label>
        <input
          type="text"
          name="otp"
          placeholder="Enter 6-digit OTP"
          value={formik.values.otp}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          maxLength={6}
          className={`w-full border-2 ${
            formik.touched.otp && formik.errors.otp
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-gray-300 focus:border-purple-500 focus:ring-purple-100"
          } focus:ring-4 rounded-lg p-3.5 text-center text-xl font-semibold tracking-widest transition-all outline-none`}
        />

        <p className="mt-2 text-xs text-gray-500">
          We&apos;ve sent a verification code to your {type}.
        </p>

        {formik.touched.otp && formik.errors.otp && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm mt-3">
            {formik.errors.otp}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        Verify Code
        <LuArrowRight className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={isResending || timer > 0}
        className="w-full text-purple-600 hover:text-purple-700 font-medium text-sm py-2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <LuRefreshCcw
          className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`}
        />
        {isResending
          ? "Resending..."
          : timer > 0
          ? `Resend in ${formatTime(timer)}`
          : "Resend Code"}
      </button>
    </form>
  );
}
