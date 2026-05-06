import React from "react";
import { Metadata } from "next";
import dynamic from "next/dynamic";
import Image from "next/image";

const VisionSection = dynamic(() => import("./_about_components/Vision"));
const StatsSection = dynamic(() => import("./_about_components/StatsSection"));
const MissionSection = dynamic(
  () => import("./_about_components/MissionSection"),
);
const Story = dynamic(() => import("./_about_components/Story"));
const Testimonials = dynamic(
  () => import("../../_home_component/Testimonials"),
);
const FaqsSection = dynamic(() => import("../../_home_component/FaqsSection"));

const title = "About Us";
const description =
  "Learn about Campusaim, an education discovery platform helping students explore schools, colleges, universities, courses, coaching institutes, and exams.";
const featuredImage = [
  {
    url: "/img/main-images/about-campusaim.png",
    width: 1200,
    height: 700,
    alt: "About Campusaim",
  },
];
export const metadata: Metadata = {
  title: title,
  description: description,
  keywords: ["About Campusaim", "About us Campusaim"],
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: title,
    description: description,
    url: "/about-us",
    siteName: "Campusaim",
    images: featuredImage,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    images: featuredImage,
  },
};

const AboutUs = () => {
  return (
    <div>
      <div className="px-4 sm:px-8 py-14 bg-(--primary-bg) text-(--text-color)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          <div className="relative flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl max-w-3xl text-(--text-color-emphasis)">
              About <span className="text-(--main)">Campusaim</span>
            </h1>
            <div className="mt-6 mb-10 w-84 h-0.5 bg-linear-to-r from-(--main) to-transparent" />

            <div className="space-y-6 max-w-3xl">
              <p className="leading-relaxed">
                Campusaim is an education discovery platform created to help
                students explore colleges, universities, schools, coaching
                institutes, courses, and entrance exams in one place.
              </p>
              <p className="leading-relaxed">
                Our goal is to make education research simple, clear, and
                accessible for every student by providing structured and
                reliable academic information.
              </p>

              <p className="leading-relaxed">
                From finding the right course to comparing institutions and
                understanding career opportunities, Campusaim helps students
                make informed decisions for their future with confidence.{" "}
              </p>
            </div>

            <div className="relative mt-14 max-w-2xl pl-6 border-l-2 border-(--main)/40">
              <p className="font-medium leading-relaxed">
                Education is not just about choosing an institution.
                <span className="block mt-2 text-gradient">
                  It is about finding the right path for your learning, growth,
                  and future success.
                </span>
              </p>
            </div>
          </div>
          <div className="relative min-h-70 aspect-2/1 w-full rounded-2xl overflow-hidden shadow-custom group">
            <Image
              src="/img/main-images/about-campusaim.png"
              alt="About Campusaim"
              fill
              priority
              fetchPriority="high"
              quality={80}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      <VisionSection />
      <StatsSection />
      <MissionSection />
      <Story />
      <Testimonials />
      <FaqsSection />
    </div>
  );
};

export default AboutUs;
