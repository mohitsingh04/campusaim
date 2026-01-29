"use client";

import { useCallback, useEffect, useState } from "react";
import InfoCard from "@/ui/cards/InfoCard";
import ListItem from "@/ui/list/ListItem";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { BiAward, BiBarChart } from "react-icons/bi";
import { FiZap } from "react-icons/fi";
import { useParams } from "next/navigation";
import { CourseProps } from "@/types/Types";
import { getErrorResponse } from "@/context/Callbacks";
import API from "@/context/API";
import HeadingLine from "@/ui/headings/HeadingLine";
import Loading from "@/ui/loader/Loading";

const PropertyCourseDetails = () => {
  const { property_asset_slug } = useParams();
  const [mainCourse, setMainCourse] = useState<CourseProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/property-course/slug/${property_asset_slug}`);
      console.log(res)
      setMainCourse(res.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [property_asset_slug]);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  if (loading) return <Loading />;

  return (
    <div className="p-4 space-y-10 bg-(--primary-bg)">
      {/* Title */}
      <h2 className="heading font-extrabold text-(--text-color-emphasis) mb-2">
        {mainCourse?.course_name}
      </h2>

      {/* Course Info Cards */}
      <div className="bg-(--primary-bg) rounded-custom shadow-custom p-5 space-y-4">
        <HeadingLine title="Course Information" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard
            Icon={BiBarChart}
            title="Difficulty"
            value={mainCourse?.course_level || ""}
          />
          <InfoCard
            Icon={BiAward}
            title="Certification"
            value={mainCourse?.certification_type || ""}
          />
          <InfoCard
            Icon={FiZap}
            title="Course Type"
            value={mainCourse?.course_type || ""}
          />
        </div>
      </div>

      {/* Outcomes & Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-(--secondary-bg) p-5 rounded-custom shadow-custom space-y-4">
          <HeadingLine title="What Will You Achieve" />
          <ul className="space-y-3">
            {mainCourse?.key_outcomes?.map((item, index) => (
              <ListItem key={index} text={item} type="include" />
            ))}
          </ul>
        </div>

        <div className="bg-(--secondary-bg) p-5 rounded-custom shadow-custom space-y-4">
          <HeadingLine title="Requirements" />
          <ul className="space-y-3">
            {mainCourse?.requirements?.map((item, index) => (
              <ListItem key={index} text={item} type="include" />
            ))}
          </ul>
        </div>
      </div>

      {/* Who Can Do */}
      <div className="bg-(--secondary-bg) p-5 rounded-custom shadow-custom space-y-4">
        <HeadingLine title="Who Can Do This Course" />
        <ul className="space-y-2">
          {mainCourse?.best_for?.map((item, i) => (
            <ListItem key={i} text={item} type="include" />
          ))}
        </ul>
      </div>

      {/* Description */}
      <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
        <HeadingLine title="overview" />
        <ReadMoreLess html={mainCourse?.description || ""} />
      </div>
    </div>
  );
};

export default PropertyCourseDetails;
