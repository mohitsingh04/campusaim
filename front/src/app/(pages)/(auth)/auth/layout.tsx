"use client";
import { ReactNode } from "react";
import GoogleLoginButton from "./_googleLogin/GoogleLoginButton";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <div className="h-screen flex overflow-hidden">
        <div className="hidden md:flex w-[60%] bg-linear-to-br from-slate-50 to-blue-50 flex-col items-center justify-center px-8 py-6 relative overflow-hidden">
          <div className="absolute top-16 left-16 w-4 h-4 bg-blue-200 rounded-full opacity-60"></div>
          <div className="absolute top-32 right-24 w-6 h-6 bg-blue-200 rounded-full opacity-40"></div>
          <div className="absolute bottom-24 left-12 w-3 h-3 bg-blue-300 rounded-full opacity-50"></div>
          <div className="relative mb-8 w-72 h-72 shrink-0">
            <Image
              src="/img/main-images/auth-hero.png"
              alt="Yoga Illustration"
              fill
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
          <div className="text-center max-w-xl px-4 shrink-0">
            <h1 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">
              Welcome to Yogprerna
            </h1>
            <h2 className="text-2xl font-bold text-slate-800 mb-4 leading-tight">
              Authentic Yoga for Everyday Balance
            </h2>
            <p className="text-slate-600 text-lg mb-8 leading-relaxed">
              Discover handpicked studios and trusted instructors at Yogprerna.
              Dive into tailored programs: stress-melting flows, breathwork for
              focus, retreats for renewal. From beginner to pro, infuse
              mindfulness into your life. Start now—unroll your mat.
            </p>
          </div>

          {/* <div className="absolute bottom-6 flex space-x-3">
            <div className="w-10 h-1.5 bg-blue-500 rounded-full"></div>
            <div className="w-10 h-1.5 bg-blue-500 rounded-full"></div>
            <div className="w-10 h-1.5 bg-blue-500 rounded-full"></div>
          </div> */}
        </div>

        <div className="w-full md:w-[40%] h-screen bg-slate-900 flex flex-col items-center justify-center px-6 py-8 relative overflow-y-auto scrollbar-hide">
          <div>
            <Link href={`/`}>
              <div className="relative h-12 w-64">
                <Image src={`/img/logo/logo-white.png`} fill alt="Logo" />
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-auto w-full mt-10">
            {children}
            {(pathname === "/auth/login" || pathname === "/auth/register") && (
              <>
                <div className="text-center text-xs text-gray-400 mt-4">
                  Or continue with
                </div>

                <div className="flex justify-center space-x-3 mt-3">
                  <GoogleLoginButton />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
