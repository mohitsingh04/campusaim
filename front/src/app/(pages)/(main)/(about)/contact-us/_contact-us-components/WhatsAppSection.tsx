"use client";

import { MessageSquareIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

export default function WhatsAppSection() {
  const YP_PHONE = process.env.NEXT_PUBLIC_YP_PHONE || "";

  return (
    <div className="bg-(--primary-bg) flex flex-col rounded-custom overflow-hidden h-full min-h-[400px]">
      <div className="bg-[#075E54] p-5 flex items-center gap-4 shrink-0">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-(--white) overflow-hidden border-2 border-(--white)/20 relative">
            <Image
              src="/img/logo/campusaim-small-logo.png"
              alt="Campusaim"
              fill
              sizes="56px"
              className="object-cover"
              fetchPriority="high"
            />
          </div>
          <span className="absolute bottom-0 right-0 w-4 h-4 bg-(--success) border-2 border-[#075E54] rounded-full"></span>
        </div>

        <div className="flex-1">
          <h2 className="text-(--white) font-bold text-xl leading-tight">
            YogPrerna
          </h2>
          <p className="text-(--white)/80 text-sm">
            Typically replies within a day
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 relative flex flex-col justify-between overflow-hidden w-full">
        <Image
          src="/img/main-images/whatsapp-chat-background.webp"
          alt="Chat background"
          fill
          priority
          quality={85}
          fetchPriority="high"
          className="object-cover z-0"
        />

        <div className="bg-(--white) p-4 rounded-r-2xl rounded-bl-2xl shadow-md max-w-xs relative transition-all duration-500 ease-out z-10">
          <div className="absolute top-0 -left-2 w-0 h-0 border-t-12 border-t-(--white) border-l-12 border-l-transparent"></div>

          <p className="text-(--text-color-emphasis) text-[15px] leading-snug">
            Hi there 👋 <br />
            How can I help you?
          </p>
          <div className="text-right mt-1">
            <span className="text-[10px] text-(--text-color) font-medium">
              11:07
            </span>
          </div>
        </div>

        <div className="mt-auto z-10">
          <a
            href={`https://wa.me/${YP_PHONE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="animate-whatsapp-pulse flex items-center justify-center gap-3 bg-linear-0! from-(--success) to-(--success) btn-shine text-(--white) py-4 px-6 rounded-full font-bold transition-all hover:scale-[1.05] active:scale-[0.95] text-lg w-full"
          >
            <MessageSquareIcon size={24} />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
