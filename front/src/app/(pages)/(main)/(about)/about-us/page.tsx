"use client";
import React from "react";
import StatsSection from "./_about_components/StatsSection";
import VisionSection from "./_about_components/Vision";
import MissionSection from "./_about_components/MissionSection";
import YogaTimeline from "./_about_components/Story";

const AboutUs = () => {
  return (
    <div className="relative bg-(--primary-bg) text-(--text-color) overflow-hidden">
      <div className="px-4 sm:px-8 py-14 ">
        <div className="relative ">
          <h1 className="text-4xl sm:text-5xl md:text-6xl max-w-3xl">
            About <span className="text-(--main)">Yogprerna</span>
          </h1>
          <div className="mt-6 mb-10 w-84 h-[2px] bg-gradient-to-r from-(--main) to-transparent" />

          <div className="space-y-6 max-w-3xl">
            <p className="leading-relaxed">
              Yogprerna is a conscious yoga ecosystem created to support
              learning, teaching, and living yoga in its most authentic form.
            </p>

            <p className="leading-relaxed">
              What began as a personal journey of self-practice and inner
              transformation has grown into a network of yoga institutes,
              training programs, retreats, and career opportunities — rooted in
              traditional yogic wisdom and adapted for modern life.
            </p>
          </div>

          <div className="relative mt-14 max-w-2xl pl-6 border-l-2 border-(--main)/40">
            <p className="font-medium leading-relaxed">
              Yoga is not just a practice.
              <span className="block mt-2 text-(--main)">
                It is a path of awareness, responsibility, and purposeful
                living.
              </span>
            </p>
          </div>
        </div>
      </div>

      <StatsSection />
      <VisionSection />
      <MissionSection />
      <YogaTimeline />
    </div>
  );
};

export default AboutUs;
