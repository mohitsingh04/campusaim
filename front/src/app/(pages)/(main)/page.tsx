import React from "react";
import dynamic from "next/dynamic";
import { Hero } from "./_home_component/Hero";
import InstitutesSkeleton from "@/ui/loader/page/landing/_components/InstitutesSkeleton";
import FeaturedCoursesSkeleton from "@/ui/loader/page/landing/_components/FeaturedCoursesSkeleton";

const CategorySection = dynamic(
  () => import("./_home_component/CategorySection"),
);
const PropertyCarousel = dynamic(() => import("./_home_component/Properties"), {
  loading: () => <InstitutesSkeleton />,
});
const PopularCourses = dynamic(
  () => import("./_home_component/FeaturedCourses"),
  { loading: () => <FeaturedCoursesSkeleton /> },
);
const BrowseByLocation = dynamic(
  () => import("./_home_component/BrowseByLocation"),
);
const Testimonials = dynamic(() => import("./_home_component/Testimonials"));
const FaqsSection = dynamic(() => import("./_home_component/FaqsSection"), {});

export default function Home() {
  return (
    <div>
      <Hero />
      <CategorySection />
      <PropertyCarousel />
      <PopularCourses />
      <BrowseByLocation />
      <Testimonials />
      <FaqsSection />
    </div>
  );
}
