"use client";

import { useCallback, useEffect, useState } from "react";
import InfoCard from "@/ui/cards/InfoCard";
import ListItem from "@/ui/list/ListItem";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { useParams } from "next/navigation";
import { CourseProps } from "@/types/Types";
import { getErrorResponse } from "@/context/Callbacks";
import API from "@/context/API";
import HeadingLine from "@/ui/headings/HeadingLine";
import Loading from "@/ui/loader/Loading";
import { AwardIcon, BarChartIcon, ZapIcon, ClockIcon } from "lucide-react";

const PropertyCourseDetails = () => {
  const { property_asset_slug } = useParams();
  const [mainCourse, setMainCourse] = useState<CourseProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/property-course/slug/${property_asset_slug}`);
      console.log(res.data);
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
      <div>
        <h2 className="heading font-extrabold text-(--text-color-emphasis) mb-2">
          {mainCourse?.course_name} ({mainCourse?.course_short_name})
        </h2>
        <p className="flex items-center gap-2 text-sm text-(--text-color-light)">
          <ClockIcon size={16} /> Duration: {mainCourse?.duration}
        </p>
      </div>

      {/* Course Info Cards */}
      <div className="bg-(--primary-bg) rounded-custom shadow-custom p-5 space-y-4">
        <HeadingLine title="Course Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            Icon={BarChartIcon}
            title="Certification type"
            value={mainCourse?.degree_type || ""}
          />
          <InfoCard
            Icon={AwardIcon}
            title="Program Type"
            value={mainCourse?.program_type || ""}
          />
          <InfoCard
            Icon={ZapIcon}
            title="Course Type"
            value={mainCourse?.course_type || ""}
          />
          <InfoCard
            Icon={ClockIcon}
            title="Duration"
            value={mainCourse?.duration || ""}
          />
        </div>
      </div>

      {/* Specializations & Fees */}
      {mainCourse?.specialization && mainCourse.specialization.length > 0 && (
        <div className="bg-(--primary-bg) rounded-custom shadow-custom p-5 space-y-4">
          <HeadingLine title="Available Specializations & Fees" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mainCourse.specialization.map((spec: any) => {
              const feeInfo = mainCourse.specialization_fees?.find(
                (f: any) => f.specialization_id === spec._id,
              );
              return (
                <div
                  key={spec._id}
                  className="p-4 rounded-custom shadow-custom flex justify-between items-center bg-(--secondary-bg)"
                >
                  <div>
                    <h4 className="font-bold text-(--text-color-emphasis)">
                      {spec.category_name}
                    </h4>
                    <p className="text-xs text-(--text-color-light)">
                      {spec.status}
                    </p>
                  </div>
                  {feeInfo ? (
                    <div className="text-right">
                      <p className="text-xs text-(--text-color-light)">
                        Tuition Fee
                      </p>
                      <p className="font-bold text-primary flex items-center justify-end gap-1">
                        {feeInfo.fees.currency}{" "}
                        {feeInfo.fees.tuition_fee.toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs italic text-(--text-color-light)">
                      Fees on request
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Outcomes & Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mainCourse?.best_for && (
          <div className="bg-(--secondary-bg) p-5 rounded-custom shadow-custom space-y-4">
            <HeadingLine title="Best For" />
            <ul className="space-y-3">
              {mainCourse.best_for.map((item, index) => (
                <ListItem key={index} text={item} type="include" />
              ))}
            </ul>
          </div>
        )}

        {mainCourse?.course_eligibility && (
          <div className="bg-(--secondary-bg) p-5 rounded-custom shadow-custom space-y-4">
            <HeadingLine title="Eligibilty" />
            <ul className="space-y-3">
              {mainCourse.course_eligibility.map((item: any, index: number) => (
                <ListItem key={index} text={item} type="include" />
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
        <HeadingLine title="Overview" />
        <ReadMoreLess html={mainCourse?.description || ""} />
      </div>
    </div>
  );
};

export default PropertyCourseDetails;
