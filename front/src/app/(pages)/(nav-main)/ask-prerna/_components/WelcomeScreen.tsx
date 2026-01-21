"use client";

import { LuMail } from "react-icons/lu";
import { ChatInput } from "./ChatInput";
import Link from "next/link";
import { UserProps } from "@/types/UserTypes";
import GoogleLoginButton from "@/app/(pages)/(auth)/auth/_googleLogin/GoogleLoginButton";

interface WelcomeScreenProps {
  onStart: () => void;
  onSendMessage: (message: string) => void;
  token: string;
  hasStarted: boolean;
  authUser: UserProps | null | undefined;
}

export function WelcomeScreen({
  onStart,
  onSendMessage,
  token,
  hasStarted,
  authUser,
}: WelcomeScreenProps) {
  const userName = authUser?.name?.split(" ")?.[0] || "there";

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-(--primary-bg)">
      {/* Main Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-(--main) leading-snug">
          Namaste,{" "}
          <span className="text-(--text-color-emphasis)">{userName}!</span>
        </h1>

        {/* Subheading */}
        <p className="text-base text-(--text-color) max-w-2xl leading-relaxed">
          I am <span className="font-semibold text-(--main)">Prerna</span>, your
          AI partner for yoga and wellness. I&apos;m here to help you compare
          studios, find courses, discover retreats, and answer any related
          question.
        </p>

        {/* Third line */}
        <p className="text-lg text-(--text-color) font-medium">
          Ask Me Anything
        </p>

        {/* Auth Buttons */}
        {!token && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-2 w-full">
            <div className="w-full sm:w-auto h-11 flex items-center">
              <GoogleLoginButton />
            </div>

            <Link
              href="/auth/login"
              onClick={onStart}
              className="w-full sm:w-auto h-11 px-4 bg-(--text-color-emphasis) text-(--primary-bg) rounded-custom font-medium heading-sm shadow-custom flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <LuMail className="text-xl" />
              <span className="hidden sm:inline">Continue with Email</span>
              <span className="sm:hidden">Email</span>
            </Link>
          </div>
        )}

        {/* Small Footer Note */}
        <p className="text-sm text-(--text-color) mt-4">
          Take a moment — you’re exactly where you need to be
        </p>
      </div>

      {/* Chat Input */}
      <div className="pb-6">
        <ChatInput onSendMessage={onSendMessage} hasStarted={hasStarted} />
      </div>
    </div>
  );
}
