"use client";
import { useCallback, useState } from "react";
import { LuBuilding, LuCircleAlert, LuCircleCheck } from "react-icons/lu";
import OtpInput from "./OtpInput";
import ConsentStep from "./ConsentStep";
import { PropertyProps, UserProps } from "@/types/types";
import { maskSensitive } from "@/contexts/Callbacks";
import API from "@/contexts/API";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
// import {
//   auth,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
// } from "@/contexts/Firebase";

interface VerificationFormProps {
  step: number;
  setStep: (step: number) => void;
  property: PropertyProps | null;
  authuser: UserProps | null;
}

declare global {
  interface Window {
    recaptchaVerifier: any;
    recaptchaWidgetId: any;
  }
}

export default function VerificationForm({
  step,
  setStep,
  property,
  authuser,
}: VerificationFormProps) {
  const [showOtpInput, setShowOtpInput] = useState(false);
  // const [confirmation, setConfirmation] = useState<any>(null);
  // const [status, setStatus] = useState("");

  // ✅ Initialize reCAPTCHA once only on mount
  // useEffect(() => {
  //   if (!window.recaptchaVerifier) {
  //     window.recaptchaVerifier = new RecaptchaVerifier(
  //       auth,
  //       "recaptcha-container",
  //       {
  //         size: "invisible",
  //         callback: (response: any) => {
  //           console.log("reCAPTCHA verified", response);
  //         },
  //         "expired-callback": () => {
  //           console.log("reCAPTCHA expired — resetting...");
  //           window.recaptchaVerifier.clear();
  //           delete window.recaptchaVerifier;
  //         },
  //       }
  //     );
  //     window.recaptchaVerifier.render().then((widgetId: any) => {
  //       window.recaptchaWidgetId = widgetId;
  //     });
  //   }
  // }, []);

  // ✅ Step transitions
  const handleVerifyClick = () => setShowOtpInput(true);
  const handleOtpSuccess = useCallback(() => {
    setShowOtpInput(false);
    setStep(step + 1);
  }, [setStep, step]);

  // ✅ Email Verification
  const handleSendEmailVerificationOtp = useCallback(async () => {
    try {
      const payload = {
        email: property?.property_email || "",
        property_id: property?._id,
      };
      const response = await API.post(`/property/verify/email`, payload);
      toast.success(response?.data.message);
      handleVerifyClick();
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;
      console.error(error);
      toast.error(err?.response?.data?.error || "Internal Server Error");
    }
  }, [property?.property_email, property?._id]);

  const handleEmailOtpMatch = useCallback(
    async (otp: string) => {
      try {
        const payload = { property_id: property?._id, otp };
        const response = await API.post("/property/verify/email/otp", payload);
        toast.success(response.data.message);
        handleOtpSuccess();
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        console.error(error);
        toast.error(err?.response?.data?.error || "Internal Server Error");
      }
    },
    [property?._id, handleOtpSuccess]
  );

  // ✅ Mobile Verification with Firebase
  // const sendMobileVerifyOTP = useCallback(async () => {
  //   const formattedPhone = property?.property_mobile_no;
  //   if (!formattedPhone) {
  //     toast.error("No registered mobile number found.");
  //     return;
  //   }

  //   try {
  //     // Ensure verifier exists and is valid
  //     if (!window.recaptchaVerifier) {
  //       toast.error("ReCAPTCHA not initialized. Please try again.");
  //       return;
  //     }

  //     const appVerifier = window.recaptchaVerifier;
  //     const confirmationResult = await signInWithPhoneNumber(
  //       auth,
  //       formattedPhone,
  //       appVerifier
  //     );
  //     setConfirmation(confirmationResult);
  //     setShowOtpInput(true);
  //     setStatus("✅ OTP sent to your phone!");
  //   } catch (err) {
  //     console.error("Error sending OTP:", err);
  //     setStatus("❌ Failed to send OTP. Try again.");
  //     // Reset recaptcha on failure
  //     if (window.recaptchaVerifier) {
  //       window.recaptchaVerifier.clear();
  //       delete window.recaptchaVerifier;
  //     }
  //   }
  // }, [property?.property_mobile_no]);

  // ✅ Handle OTP match for mobile
  // const handleMobileOtpMatch = async (otp: string) => {
  //   try {
  //     await confirmation.confirm(otp);
  //     toast.success("Mobile number verified successfully!");
  //     handleOtpSuccess();
  //   } catch (err) {
  //     console.error("Invalid OTP", err);
  //     toast.error("Invalid OTP, please try again.");
  //   }
  // };

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
      <div className="max-w-xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg mb-4">
            <LuBuilding className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-gray-900">
            Verify Your Property
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Secure verification process to confirm your property ownership and
            maintain platform integrity.
          </p>
        </div>

        {/* reCAPTCHA container must always exist */}
        {/* <div id="recaptcha-container"></div> */}

        {/* Step container */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          {step === 1 && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registered Email
                </label>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <LuCircleAlert className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {maskSensitive(property?.property_email)}
                  </span>
                </div>
              </div>

              {!showOtpInput ? (
                <button
                  onClick={handleSendEmailVerificationOtp}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Send Verification Code
                </button>
              ) : (
                <OtpInput
                  matchOTP={handleEmailOtpMatch}
                  resendOtp={handleSendEmailVerificationOtp}
                  type="email"
                />
              )}
            </div>
          )}

          {/* {step === 2 && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registered Mobile
                </label>
                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <LuCircleAlert className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    {maskSensitive(property?.property_mobile_no)}
                  </span>
                </div>
              </div>

              {!showOtpInput ? (
                <button
                  onClick={sendMobileVerifyOTP}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Send Verification Code
                </button>
              ) : (
                <OtpInput
                  type="mobile"
                  matchOTP={handleMobileOtpMatch}
                  resendOtp={sendMobileVerifyOTP}
                />
              )}

              <p className="text-center mt-4 text-sm text-gray-600">{status}</p>
            </div>
          )} */}

          {step === 2 && (
            <ConsentStep
              property={property}
              onConsent={() => setStep(step + 1)}
              authuser={authuser}
            />
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg mb-4">
                <LuCircleCheck className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Complete!
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                All verification steps are complete. Your property ownership has
                been successfully validated.
              </p>
              <a
                href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL}/dashboard/property/${property?._id}/verification`}
                target="_blank"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Continue to Dashboard
              </a>
            </div>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`h-2 rounded-full transition-all duration-300 ${
                num === step
                  ? "w-8 bg-gradient-to-r from-purple-600 to-purple-700"
                  : num < step
                  ? "w-2 bg-green-500"
                  : "w-2 bg-gray-300"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-gray-500 font-medium">
            Step {step} of 3
          </span>
        </div>
      </div>
    </div>
  );
}
