import API from "@/contexts/API";
import { PropertyProps, UserProps } from "@/types/types";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { LuArrowRight, LuCircleCheck, LuShield } from "react-icons/lu";

interface ConsentStepProps {
  onConsent: () => void;
  property: PropertyProps | null;
  authuser: UserProps | null;
}

export default function ConsentStep({
  onConsent,
  property,
  authuser,
}: ConsentStepProps) {
  const [consentChecked, setConsentChecked] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!consentChecked) return;
    console.log("run");
    if (!authuser?._id) return;
    try {
      const payload = {
        property_consent: consentChecked,
        property_id: property?._id,
      };
      const response = await API.post(
        `/property/verify/consent/${authuser?._id}`,
        payload
      );
      toast.success(response?.data?.message);
      onConsent();
    } catch (error) {
      console.log(error);
    }
  }, [authuser?._id, property?._id, onConsent, consentChecked]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 mb-3">
          <LuShield className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          User Consent Required
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Please review and accept our terms to proceed with property
          verification.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-3">
        <div className="flex items-start gap-3">
          <LuCircleCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            Your contact details will be used exclusively for property ownership
            validation
          </p>
        </div>
        <div className="flex items-start gap-3">
          <LuCircleCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            We maintain strict data privacy and security standards
          </p>
        </div>
        <div className="flex items-start gap-3">
          <LuCircleCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-700">
            Your information will not be shared with third parties without
            consent
          </p>
        </div>
      </div>

      <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-400 transition-all">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-0.5 cursor-pointer"
        />
        <span className="text-sm text-gray-700 leading-relaxed">
          I agree to the terms and conditions and authorize the use of my
          verified contact information for secure property validation purposes.
        </span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={!consentChecked}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-6 py-3.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Confirm & Continue
        <LuArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
