"use client";

import { useCallback, useEffect, useState } from "react";
import InfoCard from "@/ui/cards/InfoCard";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { useParams } from "next/navigation";
import { CategoryProps, ExamProps } from "@/types/Types";
import { getErrorResponse } from "@/context/Callbacks";
import API from "@/context/API";
import Image from "next/image";
import HeadingLine from "@/ui/headings/HeadingLine";
import CourseEnquiryForm from "./_course_compoents/CourseEnquiryForm";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import { UserProps } from "@/types/UserTypes";
import { getProfile } from "@/context/getAssets";
import CourseDetailSkeleton from "@/ui/loader/page/courses/CourseDetailSkeleton";
import { AwardIcon, BarChartIcon, ZapIcon } from "lucide-react";

const ExamDetails = () => {
  const { exam_slug } = useParams();
  const [mainCourse, setMainExams] = useState<ExamProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProps | null>(null);

  const getProfileUser = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      getErrorResponse(error);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  const getCourses = useCallback(async () => {
    setLoading(true);

    try {
      const results = await Promise.allSettled([
        API.get(`/exam/seo/${exam_slug}`),
        API.get(`/category`),
      ]);

      const [courseRes, categoryRes] = results;
      if (courseRes.status !== "fulfilled") {
        console.error("Failed to fetch course:", courseRes.reason);
        return;
      }

      const course = courseRes.value.data;
      const categoryData =
        categoryRes.status === "fulfilled" ? categoryRes.value.data : [];

      const categoryMap = new Map<string, string>();
      categoryData.forEach((c: CategoryProps) =>
        categoryMap.set(c._id, c.category_name),
      );

      const populatedCourse: ExamProps = {
        ...course,
        exam_mode: categoryMap.get(course.exam_mode) ?? course.exam_mode,
      };

      setMainExams(populatedCourse);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [exam_slug]);

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const imageSrc = mainCourse?.image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/exam/${mainCourse.image[0]}`
    : "/img/default-images/campusaim-courses-featured.png";

  if (loading)
    return (
      <>
        <CourseDetailSkeleton />
        <InsitutesLoader />
      </>
    );

  return (
    <div className="bg-(--secondary-bg) text-(--text-color) py-6 px-2 sm:px-8">
      <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="order-1 lg:order-2">
          <div className=" bg-(--primary-bg) rounded-custom overflow-hidden shadow-custom sticky top-28">
            <div className="relative w-full aspect-2/1">
              <Image
                src={imageSrc}
                alt={mainCourse?.exam_name || "Exam Image"}
                fill
                className="w-full object-cover aspect-16/10"
              />
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-(--main-light) text-(--main-emphasis) text-sm font-medium rounded-custom shadow-custom">
                {mainCourse?.exam_mode}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-center mb-2">
                <div className="ml-3">
                  <h1 className="heading font-semibold text-(--text-color-emphasis)">
                    {mainCourse?.exam_name}
                  </h1>
                </div>
              </div>

              <div className="md:col-span-2 mt-4 gap-y-4">
                <ButtonGroup
                  label="Send Enquiry"
                  type="submit"
                  className="w-full"
                  disable={false}
                  href="#enquiry"
                />
                {mainCourse?.application_form_link && (
                  <ButtonGroup
                    label="Application Form"
                    type="submit"
                    className="w-full"
                    disable={false}
                    href={mainCourse?.application_form_link || ""}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT — DESKTOP FIRST (order-2 on mobile) */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <h1 className="heading font-extrabold text-(--text-color-emphasis) mb-4 hidden md:block">
            {mainCourse?.exam_name}
          </h1>

          {/* Course Information */}
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Course Information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard
                Icon={BarChartIcon}
                title="Exam Mode"
                value={mainCourse?.exam_mode || ""}
              />
              <InfoCard
                Icon={AwardIcon}
                title="Upcoming Exam Date"
                value={mainCourse?.upcoming_exam_date || ""}
              />
              <InfoCard
                Icon={AwardIcon}
                title="Result Date"
                value={mainCourse?.result_date || ""}
              />
              <InfoCard
                Icon={ZapIcon}
                title="Application Form Date"
                value={mainCourse?.application_form_date || ""}
              />
            </div>
          </div>

          {/* Best For & Coure Eligibility */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Coure Eligibility" />
              <ul className="space-y-3">
                {mainCourse?.course_eligibility.map((item: any, index: any) => (
                  <ListItem key={index} text={item} type="include" />
                ))}
              </ul>
            </div>

            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Best For" />
              <ul className="space-y-3">
                {mainCourse?.best_for.map((item, index) => (
                  <ListItem key={index} text={item} type="include" />
                ))}
              </ul>
            </div>
          </div> */}

          {/* Description */}
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Overview" />
            <ReadMoreLess html={mainCourse?.description || ""} />
          </div>
          <CourseEnquiryForm exam={mainCourse} profile={profile} />
        </div>
      </div>
      <div className="">
        {/* <PropertyFilters
          allProperties={properties}
          propertyLoading={propertyLoading}
        /> */}
      </div>
    </div>
  );
};

export default ExamDetails;
