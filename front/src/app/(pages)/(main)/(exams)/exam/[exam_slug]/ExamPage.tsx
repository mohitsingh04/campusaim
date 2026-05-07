"use client";

import InfoCard from "@/ui/cards/InfoCard";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import { ButtonGroup } from "@/ui/buttons/ButtonGroup";
import { formatDate, isDateExpired } from "@/context/Callbacks";
import Image from "next/image";
import HeadingLine from "@/ui/headings/HeadingLine";
import CourseEnquiryForm from "./_exams_compoents/CourseEnquiryForm";
import {
  AwardIcon,
  BarChartIcon,
  CalendarClock,
  ExternalLink,
  FileText,
  ZapIcon,
} from "lucide-react";
import { ExamProps } from "@/types/Types";

import FaqComponents from "@/ui/accordions/FaqComponents";
import useGetAuthUser from "@/hooks/fetch-hooks/useGetAuthUser";
import { useGetAssets } from "@/context/providers/AssetsProviders";

const ExamDetails = ({ exam }: { exam: ExamProps }) => {
  const { authUser } = useGetAuthUser();
  const { getCategoryById } = useGetAssets();

  const imageSrc = exam?.image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/exam/${exam.image[0]}`
    : "/img/default-images/campusaim-courses-featured.png";

  return (
    <div className="bg-(--secondary-bg) text-(--text-color) py-6 px-2 sm:px-8">
      <div className="mb-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="order-1 lg:order-2 sticky top-28">
          <div className=" bg-(--primary-bg) rounded-custom overflow-hidden shadow-custom ">
            <div className="relative w-full aspect-2/1">
              <Image
                src={imageSrc}
                alt={exam?.exam_name || "Exam Image"}
                fill
                className="w-full object-cover aspect-16/10"
              />
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-(--main-subtle) text-(--main-emphasis) text-sm font-medium rounded-custom shadow-custom">
                {getCategoryById(exam?.exam_mode)}
              </span>
            </div>

            <div className="p-5">
              <div className="flex items-center mb-2">
                <div className="ml-3">
                  <h1 className="heading font-semibold text-(--text-color-emphasis)">
                    {exam?.exam_name}
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
                {exam?.answer_sheet && (
                  <ButtonGroup
                    label="Answer Sheet"
                    type="submit"
                    className="w-full"
                    disable={false}
                    target="_blank"
                    href={`${process.env.NEXT_PUBLIC_MEDIA_URL}/exam/${exam?.answer_sheet}`}
                  />
                )}
              </div>
            </div>
          </div>
          <div className="bg-(--primary-bg) p-5 rounded-custom mt-4 shadow-custom ">
            <HeadingLine title="Important Links" />
            <div className="space-y-3 mt-5">
              {exam?.application_form_link && (
                <a
                  href={exam?.application_form_link}
                  target="_blank"
                  className="flex items-center justify-between p-4 rounded-custom bg-(--secondary-bg) hover:bg-(--main-subtle) transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-(--main-emphasis)" />
                    <span className="font-medium">Application Form</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {exam?.youtube_link && (
                <a
                  href={exam?.youtube_link}
                  target="_blank"
                  className="flex items-center justify-between p-4 rounded-custom bg-(--secondary-bg) hover:bg-(--main-subtle) transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <ZapIcon className="w-5 h-5 text-(--main-emphasis)" />
                    <span className="font-medium">Youtube Video</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {exam?.exam_form_link && (
                <a
                  href={exam?.exam_form_link}
                  target="_blank"
                  className="flex items-center justify-between p-4 rounded-custom bg-(--secondary-bg) hover:bg-(--main-subtle) transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-(--main-emphasis)" />
                    <span className="font-medium">Exam Form Link</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <h1 className="heading font-extrabold text-(--text-color-emphasis) mb-4 hidden md:block">
            {exam?.exam_name}{" "}
            {exam?.exam_short_name && `(${exam?.exam_short_name})`}
          </h1>
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
              <InfoCard
                Icon={BarChartIcon}
                title="Exam Mode"
                value={getCategoryById(exam?.exam_mode || "")||"N/A"}
              />
              <InfoCard
                Icon={BarChartIcon}
                title="Exam Type"
                value={getCategoryById(exam?.exam_type || "") || "N/A"}
              />

              <InfoCard
                Icon={AwardIcon}
                title="Upcoming Exam"
                tags={[
                  {
                    name: "Tentative",
                    value: exam?.upcoming_exam_date?.is_tentative,
                    color: "yellow",
                  },
                  {
                    name: "Expired",
                    value: isDateExpired(exam?.upcoming_exam_date?.date),
                    color: "red",
                  },
                ]}
                isDanger={isDateExpired(exam?.upcoming_exam_date?.date)}
                value={`${formatDate(
                  exam?.upcoming_exam_date?.date || "N/A",
                )}*`}
              />

              <InfoCard
                Icon={CalendarClock}
                tags={[
                  {
                    name: "Tentative",
                    value: exam?.result_date?.is_tentative,
                    color: "yellow",
                  },
                  {
                    name: "Expired",
                    value: isDateExpired(exam?.result_date?.date),
                    color: "red",
                  },
                ]}
                isDanger={isDateExpired(exam?.result_date?.date)}
                title="Result Date"
                value={`${formatDate(exam?.result_date?.date || "N/A")}*`}
                note=""
              />

              <InfoCard
                Icon={ZapIcon}
                tags={[
                  {
                    name: "Tentative",
                    value: exam?.application_form_date?.is_tentative,
                    color: "yellow",
                  },
                  {
                    name: "Expired",
                    value: isDateExpired(exam?.application_form_date?.start),
                    color: "red",
                  },
                ]}
                isDanger={isDateExpired(exam?.application_form_date?.start)}
                title="Application Form Start Date"
                value={`${formatDate(
                  exam?.application_form_date?.start || "",
                )}*`}
              />
              <InfoCard
                Icon={ZapIcon}
                tags={[
                  {
                    name: "Tentative",
                    value: exam?.application_form_date?.is_tentative,
                    color: "yellow",
                  },
                  {
                    name: "Expired",
                    value: isDateExpired(exam?.application_form_date?.end),
                    color: "red",
                  },
                ]}
                isDanger={isDateExpired(exam?.application_form_date?.end)}
                title="Application Form End Date"
                value={`${formatDate(exam?.application_form_date?.end || "")}*`}
              />
            </div>
            <p className="mt-4 text-[5px] italic">
              <span className="font-bold">Note: </span>Dates are tentative and
              subject to change by the organizing body.
            </p>
          </div>
          <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
            <HeadingLine title="Overview" />
            <ReadMoreLess html={exam?.description || ""} />
          </div>
          {(exam?.faqs?.length || 0) > 0 && (
            <div className="bg-(--primary-bg) p-5 rounded-custom shadow-custom">
              <HeadingLine title="Frequently Asked Questions" />
              <FaqComponents faqs={exam?.faqs || []} />
            </div>
          )}
          <CourseEnquiryForm exam={exam} profile={authUser} />
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;
