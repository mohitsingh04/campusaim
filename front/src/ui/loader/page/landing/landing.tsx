import React from "react";
import HeroSkeleton from "./_components/HeroSkeleton";
import AcademicTypeSkeleton from "./_components/AcademicTypeSkeleton";
import InstitutesSkeleton from "./_components/InstitutesSkeleton";
import FeaturedCoursesSkeleton from "./_components/FeaturedCoursesSkeleton";
import LocationSkeleton from "./_components/LocationSkeleton";
import TestimonialsSkeleton from "./_components/TestimonialSkeleton";
import FAQSkeleton from "./_components/FaqsSkeleton";

export default function Landing() {
  return (
    <div>
      <HeroSkeleton />
      <AcademicTypeSkeleton />
      <InstitutesSkeleton />
      <FeaturedCoursesSkeleton />
      <LocationSkeleton />
      <TestimonialsSkeleton />
      <FAQSkeleton />
    </div>
  );
}
