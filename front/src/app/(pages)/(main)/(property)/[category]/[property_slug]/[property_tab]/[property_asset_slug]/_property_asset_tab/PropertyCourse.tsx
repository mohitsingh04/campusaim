"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronDown,
  AwardIcon,
  ClockIcon,
  ZapIcon,
  BarChartIcon,
} from "lucide-react";

import ListItem from "@/ui/list/ListItem";
import { ReadMoreLess } from "@/ui/texts/ReadMoreLess";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { CourseProps } from "@/types/Types";
import HeadingLine from "@/ui/headings/HeadingLine";
import InfoCard from "@/ui/cards/InfoCard";
import { useQuery } from "@tanstack/react-query";
import TabLoading from "@/ui/loader/component/TabLoading";

const PropertyCourseDetails = () => {
  const { property_asset_slug } = useParams();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { data: mainCourse, isLoading } = useQuery<CourseProps | null>({
    queryKey: ["property-main-course", property_asset_slug],
    queryFn: async () => {
      try {
        const response = await API.get(
          `/property-course/slug/${property_asset_slug}`,
        );
        return response.data || [];
      } catch (error) {
        getErrorResponse(error, true);
        throw error;
      }
    },
    enabled: !!property_asset_slug,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <TabLoading />;

  if (!mainCourse)
    return <div className="p-10 text-center">Course details unavailable.</div>;

  const firstImage = mainCourse?.image?.[0]
    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/course/${mainCourse.image[0]}`
    : "/img/default-images/campusaim-courses-featured.png";

  return (
    <div className="p-4 md:p-8 bg-(--primary-bg) text-(--text-color) space-y-12">
      <header className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="text-primary font-bold text-xs uppercase tracking-widest">
              {mainCourse.course_type}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-(--text-color-emphasis) leading-tight">
              {mainCourse.course_name}
              <span className="text-(--text-subtle) block mt-1 text-xl md:text-2xl font-medium">
                ({mainCourse.course_short_name})
              </span>
            </h1>
          </div>

          <div className="w-full lg:w-[400px] shrink-0">
            <div className="relative aspect-2/1 w-full rounded-custom overflow-hidden shadow-custom border border-(--border)">
              <Image
                src={firstImage}
                alt="Course Preview"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        <div>
          <HeadingLine title="Academic Overview" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <InfoCard
              Icon={BarChartIcon}
              title="Certification"
              value={mainCourse.degree_type || "N/A"}
            />
            <InfoCard
              Icon={AwardIcon}
              title="Program"
              value={mainCourse.program_type || "N/A"}
            />
            <InfoCard
              Icon={ZapIcon}
              title="Level"
              value={mainCourse.course_type || "N/A"}
            />
            <InfoCard
              Icon={ClockIcon}
              title="Duration"
              value={mainCourse.duration || "N/A"}
            />
          </div>
        </div>
      </header>

      <main className="space-y-12">
        <section className="space-y-4">
          <HeadingLine title="About this course" />
          <ReadMoreLess html={mainCourse.description || ""} />
        </section>

        {mainCourse.specialization && mainCourse.specialization.length > 0 && (
          <section className="space-y-6">
            <HeadingLine title="Specializations & Investment" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mainCourse.specialization.map((spec: any, index: number) => {
                const feeInfo = mainCourse.specialization_fees?.find(
                  (f: any) => f.specialization_id === spec._id,
                );
                return (
                  <div
                    key={index}
                    className="p-5 rounded-custom flex justify-between items-center bg-(--secondary-bg) shadow-custom group"
                  >
                    <h4 className="font-bold text-lg text-(--text-color-emphasis)">
                      {spec.category_name}
                    </h4>
                    <div className="text-right">
                      <p className="text-[10px] text-(--subtle) uppercase font-bold tracking-widest mb-1">
                        Tuition Fee
                      </p>
                      <p className="text-xl font-black text-primary">
                        {feeInfo
                          ? `${feeInfo.fees.currency} ${feeInfo.fees.tuition_fee.toLocaleString()}`
                          : "On Request"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-(--secondary-bg) p-8 rounded-custom shadow-custom border-t-4 border-(--main) space-y-4">
            <HeadingLine title="Who is this for?" />
            <ul className="space-y-4 pt-2">
              {mainCourse.best_for?.map((item, index) => (
                <ListItem key={index} text={item} type="include" />
              ))}
            </ul>
          </div>

          <div className="bg-(--secondary-bg) p-8 rounded-custom shadow-custom border-t-4 border-blue-500 space-y-4">
            <HeadingLine title="Eligibility Criteria" />
            <ul className="space-y-4 pt-2">
              {mainCourse.course_eligibility?.map(
                (item: string, index: number) => (
                  <ListItem key={index} text={item} type="include" />
                ),
              )}
            </ul>
          </div>
        </section>

        {mainCourse.faqs && mainCourse.faqs.length > 0 && (
          <section className="space-y-8">
            <HeadingLine title="Frequently Asked Questions" />
            <div className="grid gap-4">
              {mainCourse.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-custom overflow-hidden bg-(--secondary-bg) shadow-custom"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center p-5 text-left font-bold text-(--text-color-emphasis) transition-colors"
                  >
                    <span className="pr-4">{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`text-(--text-color) shrink-0 transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === i && (
                    <ReadMoreLess
                      html={faq?.answer}
                      className="px-6 py-4 border-t border-(--border)"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default PropertyCourseDetails;
