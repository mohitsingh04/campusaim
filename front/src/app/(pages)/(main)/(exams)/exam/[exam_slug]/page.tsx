"use client";

import { useCallback, useEffect, useState } from "react";
import InfoCard from "@/ui/cards/InfoCard";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { useParams } from "next/navigation";
import { ExamProps } from "@/types/Types";
import { getErrorResponse } from "@/context/Callbacks";
import API from "@/context/API";
import Image from "next/image";
import HeadingLine from "@/ui/headings/HeadingLine";
import CourseEnquiryForm from "./_exams_compoents/CourseEnquiryForm";
import InsitutesLoader from "@/ui/loader/page/institutes/Institutes";
import CourseDetailSkeleton from "@/ui/loader/page/courses/CourseDetailSkeleton";
import { AwardIcon, BarChartIcon, ZapIcon } from "lucide-react";
import FaqComponents from "@/ui/accordions/FaqComponents";
import useGetAuthUser from "@/hooks/fetch-hooks/useGetAuthUser";
import { useGetAssets } from "@/context/providers/AssetsProviders";

const ExamDetails = () => {
  const { exam_slug } = useParams();
  const [mainCourse, setMainExams] = useState<ExamProps | null>(null);
  const [loading, setLoading] = useState(true);
  const { authUser } = useGetAuthUser();
  const { getCategoryById } = useGetAssets();

  const getCourses = useCallback(async () => {
    setLoading(true);

    try {
      const response = await API.get(`/exam/seo/${exam_slug}`);
      const course = response.data;
      const populatedCourse: ExamProps = {
        ...course,
        exam_mode: getCategoryById(course.exam_mode) ?? course.exam_mode,
      };

      setMainExams(populatedCourse);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [exam_slug, getCategoryById]);

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
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-(--main-subtle) text-(--main-emphasis) text-sm font-medium rounded-custom shadow-custom">
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

        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <h1 className="heading font-extrabold text-(--text-color-emphasis) mb-4 hidden md:block">
            {mainCourse?.exam_name}
          </h1>

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

          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Overview" />
            <ReadMoreLess html={mainCourse?.description || ""} />
          </div>
          {(mainCourse?.faqs?.length || 0) > 0 && (
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Frequently Asked Questions" />
              <FaqComponents faqs={mainCourse?.faqs || []} />
            </div>
          )}
          <CourseEnquiryForm exam={mainCourse} profile={authUser} />
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
