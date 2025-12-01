import React from "react";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import API from "@/contexts/API";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";
import { FcGoogle } from "react-icons/fc";

const GoogleLoginButton = () => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse: TokenResponse) => {
      console.log(tokenResponse)
      try {
        const res = await API.post("/profile/google/login", {
          token: tokenResponse.access_token, 
        });

        console.log("Login successful:", res.data);
        window.location.reload();
      } catch (error) {
        console.error("Login error:", error);
        const err = error as AxiosError<{ error: string }>;
        toast.error(
          err.response?.data?.error || "Login failed. Please try again."
        );
      }
    },
    onError: () => {
      console.error("Google Login failed");
      toast.error("Google login failed. Please try again.");
    },
    flow: "implicit", // if your backend expects OAuth tokens
  });

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center w-full px-5 py-3 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm text-nowrap"
    >
      <FcGoogle className="text-xl me-2" />
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton;
