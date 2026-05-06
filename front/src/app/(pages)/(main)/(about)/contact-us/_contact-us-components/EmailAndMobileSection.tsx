"use client";

import { handleCopy } from "@/context/Callbacks";
import React from "react";
import {
  ChevronRight,
  CopyIcon,
  LucideIcon,
  MailIcon,
  PhoneCall,
} from "lucide-react";
// import { SocialLinksComponent } from "@/common/SocailMedaiData";

const YP_EMAIL = `${process.env.NEXT_PUBLIC_YP_EMAIL}`;
const YP_PHONE = `${process.env.NEXT_PUBLIC_YP_PHONE}`;

const CopyButton = ({ text, label }: { text: string; label: string }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCopy(text, label);
    }}
    className={`p-2 rounded-lg transition-all duration-300 active:scale-90 z-30 relative bg-(--primary-bg) text-(--main)`}
    title={`Copy ${label}`}
  >
    <CopyIcon size={16} />
  </button>
);

const ContentCard = ({
  icon,
  value,
  label,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  value: string;
  label: "email" | "phone";
  title: string;
  subtitle: string;
}) => {
  const Icon = icon;
  return (
    <div className="relative flex-1 group overflow-hidden rounded-custom bg-(--secondary-bg) text-(--text-color) shadow-custom transition-all duration-500 hover:-translate-y-1 flex flex-col min-h-0">
      <div className="absolute top-0 right-0 w-24 h-24 bg-(--main)/20 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />
      <div className="relative p-5 md:p-6 flex flex-col justify-between h-full z-10">
        <div className="flex justify-between items-start">
          <div className="bg-(--main-subtle) p-2.5 rounded-xl backdrop-blur-md">
            <Icon size={26} className="text-(--main)" />
          </div>
          <CopyButton text={value} label={label} />
        </div>

        <div className="mt-2">
          <div className="flex items-center gap-2 mb-1">
            <p className="heading font-semibold text-xs">{title}</p>
          </div>
          <h3 className="text-lg md:text-xl font-serif mb-2 leading-tight">
            {subtitle}
          </h3>
          <a
            href={label === "email" ? `mailto:${value}` : `tel:${value}`}
            className="inline-flex items-center gap-2 mt-2 bg-(--main-subtle) text-(--main-emphasis) px-4 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-custom active:scale-95 text-xs md:text-sm break-all"
          >
            {value} <ChevronRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default function EmailAndMobileSection() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <ContentCard
        icon={MailIcon}
        value={YP_EMAIL}
        label="email"
        title="Email Us"
        subtitle="Send us an inquiry"
      />
      <ContentCard
        icon={PhoneCall}
        value={YP_PHONE}
        label="phone"
        title="Talk to Us"
        subtitle="Mon - Sat, 9am - 6pm"
      />
      {/* <div className="col-span-1 md:col-span-2 bg-(--secondary-bg) flex items-center justify-between p-6 rounded-custom shadow-custom">
        <div className="flex flex-col">
          <h3 className="heading font-semibold">Follow Us</h3>
          <p>@Campusaim</p>
        </div>
        <SocialLinksComponent classNames="gap-2" size="w-10 h-10" />
      </div> */}
    </div>
  );
}
