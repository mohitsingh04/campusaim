"use client";

import { BiMailSend } from "react-icons/bi";
import { useFormik } from "formik";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getErrorResponse,
  getFormikError,
  getSuccessResponse,
} from "@/context/Callbacks";
import { emailValidation } from "@/context/ValidationSchema";
import API from "@/context/API";

export default function ComingSoon() {
  const [subscribed, setSubscribed] = useState(false);
  const searchParams = useSearchParams();

  // get source from query string
  const sourceFromURL = searchParams.get("source");

  const formik = useFormik({
    initialValues: {
      email: "",
      source: sourceFromURL || "",
    },
    enableReinitialize: true,
    validationSchema: emailValidation,

    onSubmit: async (values, { resetForm }) => {
      try {
        const res = await API.post("/add/news-letter", values);

        if (res) {
          setSubscribed(true);
          resetForm();
          getSuccessResponse(res);
          return;
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#6EB5F7] to-[#CDE9FF] relative overflow-hidden flex flex-col font-sans">
      <main className="grow flex flex-col items-center justify-center relative w-full px-4 pb-12">
        {/* BIG COMING SOON TEXT */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] select-none w-full text-center pointer-events-none">
          <h1 className="text-[15vw] md:text-[18vw] font-bold text-white leading-none tracking-tighter opacity-40 blur-sm">
            COMING SOON
          </h1>
        </div>

        <div className="relative z-20 flex flex-col items-center text-center max-w-4xl space-y-8 md:space-y-10 w-full">
          {/* TITLE */}
          <div className="space-y-3 px-2">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#1e3a8a] leading-tight drop-shadow-sm">
              We are launching soon
            </h2>
            <p className="text-slate-700 text-base md:text-lg lg:text-xl font-medium max-w-lg mx-auto">
              We&apos;re polishing the final details to give you the best
              experience possible.
            </p>
          </div>

          {/* FORM */}
          <div className="w-full max-w-md mx-auto px-2">
            {!subscribed ? (
              <form onSubmit={formik.handleSubmit}>
                <div className="relative group w-full">
                  {/* ICON */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10">
                    <BiMailSend size={16} />
                  </div>

                  {/* INPUT */}
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email..."
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full bg-white pl-11 pr-[120px] md:pr-36 py-3 rounded-full shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-700 placeholder:text-slate-400 transition text-sm"
                  />

                  {/* SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={!formik.values.email}
                    className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#1e3a8a] text-white px-4 md:px-6 rounded-full font-semibold shadow-md transition-all hover:shadow-lg active:scale-95 text-xs cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
                  >
                    Notify Me
                  </button>
                </div>

                {/* VALIDATION ERROR */}
                {getFormikError(formik, "email")}
              </form>
            ) : (
              <div className="bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold shadow-sm animate-pulse border border-green-200">
                Thanks! You&apos;re on the list.
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-white/20 to-transparent pointer-events-none" />
    </div>
  );
}
