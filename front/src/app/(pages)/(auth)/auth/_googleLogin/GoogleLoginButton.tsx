"use client";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { toast } from "react-toastify";
import Image from "next/image";

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
      type="button"
      className="w-full sm:w-auto h-11 px-6 bg-(--text-color-emphasis) text-(--primary-bg) rounded-custom font-medium heading-sm shadow-custom flex items-center justify-center gap-3 transition cursor-pointer hover:opacity-90 active:scale-95"
    >
      <Image
        src="/img/social-links/google.webp"
        alt="Google icon"
        width={20}
        height={20}
        quality={90}
        priority={true}
        className="shrink-0 object-contain"
      />
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleLoginButton;
