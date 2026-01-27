"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BiHome } from "react-icons/bi";
import { BsArrowLeftCircle } from "react-icons/bs";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#6EB5F7] to-[#CDE9FF] relative overflow-hidden flex flex-col font-sans">
      <nav className="w-full p-6 flex justify-between items-center z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-white font-bold text-xl cursor-pointer"
        >
          <div className="w-44 h-12 relative">
            <Image
              src="/img/logo/campusaim-logo.png"
              alt="Confused Blue Monster"
              fill
              className="mx-auto object-contain drop-shadow-2xl"
            />
          </div>
        </Link>
      </nav>

      <main className="grow flex flex-col items-center justify-center relative z-10 px-4">
        <div className="relative select-none">
          <h1 className="text-[10rem]! md:text-[16rem]! font-bold! text-white! leading-none! tracking-tighter! opacity-90 drop-shadow-sm">
            404
          </h1>

          <div className="absolute sm:top-28 top-20 left-1/2 transform -translate-x-1/2 -translate-y-[40%] w-64 md:w-96">
            <div className="md:w-54 w-30 md:h-54 h-30">
              <Image
                src="/img/main-images/notfound1.gif"
                alt="Confused Blue Monster"
                fill
                className="mx-auto object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="text-center z-20 space-y-4">
          <h2 className="text-3xl! font-bold text-[#1e3a8a]!">
            Oops, I think we&apos;re lost...
          </h2>
          <p className="text-[#475569]! text-lg! font-medium">
            Let&apos;s get you back to somewhere familiar.
          </p>

          <div className="pt-4 flex gap-2! justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-white text-slate-800 px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <BiHome size={20} />
              Back Home
            </Link>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 bg-white text-slate-800 px-4 py-2 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <BsArrowLeftCircle size={20} />
              Go Back
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
