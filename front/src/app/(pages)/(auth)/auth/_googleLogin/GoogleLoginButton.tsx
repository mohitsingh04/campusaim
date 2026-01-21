"use client";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { toast } from "react-toastify";

const GoogleLoginButton = () => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse: TokenResponse) => {
      try {
        const res = await API.post("/profile/google/login", {
          token: tokenResponse.access_token,
        });
        console.log("Login successful:", res.data);
        window.location.reload();
      } catch (error) {
        getErrorResponse(error);
      }
    },
    onError: () => {
      console.error("Google login failed. Please try again.");
      toast.error("Google login failed. Please try again.");
    },
    flow: "implicit",
  });

  return (
    <button
      onClick={() => login()}
      className="w-full sm:w-auto h-11 px-4 bg-(--text-color-emphasis) text-(--primary-bg) rounded-custom font-medium heading-sm shadow-custom flex items-center justify-center gap-2 transition cursor-pointer"
    >
      <FcGoogle className="text-xl me-2" />
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton;
