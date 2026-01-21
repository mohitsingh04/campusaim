"use client";

import { generateSlug } from "@/context/Callbacks";
import { PropertyCourseProps, PropertyProps } from "@/types/PropertyTypes";
import HeadingLine from "@/ui/headings/HeadingLine";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import {
  LuChevronDown,
  LuBookOpen,
  LuGraduationCap,
  LuBook,
  LuPen,
  LuClock,
  LuTarget,
  LuChartBar,
  LuAward,
  LuLaptop,
} from "react-icons/lu";

export default function CourseTable({
  selectedProperties,
}: {
  selectedProperties: PropertyProps[];
}) {
  const [isOpen, setIsOpen] = useState(true);

  const allCourses = useMemo(() => {
    const seen = new Set<string>();
    const courses: { id: string; name: string }[] = [];
    selectedProperties.forEach((prop) => {
      prop.courses?.forEach((course: PropertyCourseProps) => {
        if (course?.course_name && !seen.has(course.course_name)) {
          seen.add(course.course_name);
          courses.push({
            id: course.course_name,
            name: course.course_name,
          });
        }
      });
    });
    return courses;
  }, [selectedProperties]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  useEffect(() => {
    if (!selectedCourseId && allCourses.length > 0) {
      setSelectedCourseId(allCourses[0].id);
    }
  }, [allCourses, selectedCourseId]);

  const courseFields = [
    { key: "Course Name", label: "Course Name", icon: LuBook },
    { key: "Short Name", label: "Short Name", icon: LuPen },
    { key: "Duration", label: "Duration", icon: LuClock },
    { key: "Course Type", label: "Course Type", icon: LuTarget },
    { key: "Course Level", label: "Course Level", icon: LuChartBar },
    { key: "Certification Type", label: "Certification", icon: LuAward },
    { key: "Course Format", label: "Format", icon: LuLaptop },
  ];

  const gridCols =
    selectedProperties.length === 1
      ? "grid-cols-1"
      : selectedProperties.length === 2
      ? "grid-cols-2"
      : "grid-cols-3";

  return (
    <div
      className={`bg-(--secondary-bg) sm:rounded-t-xl shadow-custom border border-(--border) transition-all duration-300 ${
        isOpen ? "overflow-visible" : "overflow-hidden"
      }`}
    >
      {/* Header */}
      <div
        className="bg-(--main-emphasis) cursor-pointer sm:px-6 px-4 py-3 transition-all duration-200 relative overflow-hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <HeadingLine
                title="Course Comparison"
                className="text-(--white)! mb-0!"
              />
              <p className="ml-3 text-(--white)! text-xs sm:text-base">
                Compare courses across {selectedProperties.length} colleges
              </p>
            </div>
          </div>

          {/* Right Buttons */}
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-full bg-(--main-light) cursor-pointer text-(--main-emphasis) backdrop-blur-sm transition-all duration-300 hover:scale-110 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              <LuChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen
            ? "max-h-[3000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="p-0">
          {allCourses.length > 0 ? (
            <>
              <div className="hidden sm:block w-full overflow-x-auto">
                <div className="px-4 py-3 bg-(--primary-bg) text-(--text-color-emphasis) border-b border-(--border)">
                  <label className="sub-heading font-semibold mb-1">
                    Select Course to Compare:
                  </label>

                  <div className="relative w-full max-w-md">
                    <select
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      className="w-full appearance-none px-4 py-2 text-(--text-color) border border-(--border) rounded-custom bg-(--secondary-bg) shadow-custom paragraph font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-(--border) pr-10"
                    >
                      {allCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                      ))}
                    </select>

                    <LuChevronDown
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--main) pointer-events-none"
                    />
                  </div>
                </div>

                {/* Table Fixed applied here */}
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="bg-(--primary-bg) text-(--text-color) border-b border-(--border)">
                      {/* Fixed width for label column */}
                      <th className="p-4 font-semibold border-r border-(--border) w-52 sub-heading"></th>
                      {selectedProperties.map((p, i) => (
                        <th
                          key={i}
                          // Fixed width for property columns
                          className="text-center p-4 font-semibold text-(--text-color) border-r border-(--border) last:border-r-0 w-80"
                        >
                          <div className="flex flex-col items-center relative">
                            <Link
                              href={`/${generateSlug(
                                p.category
                              )}/${generateSlug(p?.property_slug)}/overview`}
                            >
                              {!p?.property_logo?.[0] ? (
                                <div className="w-10 h-10 rounded-custom flex items-center justify-center mb-2 shadow-custom">
                                  <span className="font-bold paragraph">
                                    {p.property_name.charAt(0)}
                                  </span>
                                </div>
                              ) : (
                                <div className="relative w-14 h-14 rounded-custom shadow-custom transition-all duration-300 mb-3 overflow-hidden">
                                  <Image
                                    src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${p.property_logo?.[0]}`}
                                    alt={p.property_name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </Link>
                            <Link
                              href={`/${generateSlug(
                                p.category
                              )}/${generateSlug(p?.property_slug)}/overview`}
                              className="paragraph font-medium text-center leading-tight wrap-break-word"
                            >
                              {p.property_name}
                            </Link>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-(--border)">
                    {courseFields.map((field, idx) => (
                      <tr key={idx} className="transition-colors duration-200">
                        <td className="font-semibold p-4 text-(--text-color) bg-(--primary-bg) border-r border-(--border)">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-(--main-light) text-(--main-emphasis) rounded-custom flex items-center justify-center shadow-custom">
                              <field.icon size={14} />
                            </div>
                            <span className="heading-sm">{field.label}</span>
                          </div>
                        </td>

                        {selectedProperties.map((prop, pIdx) => {
                          const course = prop.courses?.find(
                            (c: PropertyCourseProps) =>
                              c.course_name === selectedCourseId
                          );
                          let displayValue = "Not Available";
                          if (course) {
                            switch (field.key) {
                              case "Course Name":
                                displayValue = course.course_name || "N/A";
                                break;
                              case "Short Name":
                                displayValue =
                                  course.course_short_name || "N/A";
                                break;
                              case "Duration":
                                displayValue = course.duration || "N/A";
                                break;
                              case "Course Type":
                                displayValue = course.course_type || "N/A";
                                break;
                              case "Course Level":
                                displayValue = course.course_level || "N/A";
                                break;
                              case "Certification Type":
                                displayValue =
                                  course.certification_type || "N/A";
                                break;
                              case "Course Format":
                                displayValue = course.course_format || "N/A";
                                break;
                            }
                          }
                          return (
                            <td
                              key={pIdx}
                              className="text-center p-4 border-r border-(--border) last:border-r-0"
                            >
                              <span className="inline-flex gap-2 text-(--text-color-emphasis)">
                                {displayValue}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden block">
                <div className="sticky top-16 bg-(--primary-bg) shadow-md border-b border-(--border)">
                  <div className="px-4 py-3 bg-(--primary-bg) border-b border-(--border)">
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2 text-(--text-color-emphasis)">
                      <LuGraduationCap size={14} className="text-(--main)" />
                      Select Course:
                    </label>
                    <div className="relative w-full">
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full appearance-none px-3 py-2 text-sm text-(--text-color) border border-(--border) rounded-custom bg-(--secondary-bg) shadow-sm font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-(--main) pr-8"
                      >
                        {allCourses.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.name}
                          </option>
                        ))}
                      </select>
                      <LuChevronDown
                        size={16}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-(--main) pointer-events-none"
                      />
                    </div>
                  </div>

                  <div className={`grid ${gridCols} bg-(--primary-bg)`}>
                    {selectedProperties.map((p, i) => (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-start p-3 border-(--border) ${
                          i < selectedProperties.length - 1 ? "border-r" : ""
                        }`}
                      >
                        <Link
                          href={`/${generateSlug(p.category)}/${generateSlug(
                            p?.property_slug
                          )}/overview`}
                        >
                          {!p?.property_logo?.[0] ? (
                            <div className="w-10 h-10 rounded-custom flex items-center justify-center shadow-custom bg-(--secondary-bg)">
                              <span className="font-bold text-base">
                                {p.property_name.charAt(0)}
                              </span>
                            </div>
                          ) : (
                            <div className="relative w-10 h-10 rounded-custom shadow-custom overflow-hidden">
                              <Image
                                src={`${process.env.NEXT_PUBLIC_MEDIA_URL}/${p.property_logo?.[0]}`}
                                alt={p.property_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </Link>
                        <div className="mt-1 text-center text-[10px] sm:text-xs font-semibold leading-tight line-clamp-2 min-h-[2.4em]">
                          {p.property_name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="divide-y divide-(--border)">
                  {courseFields.map((field, idx) => (
                    <div key={idx} className="bg-(--primary-bg)">
                      <div className="p-2 flex items-center justify-center gap-2 bg-(--secondary-bg) text-(--text-color-empahsis) border border-(--border)">
                        <field.icon size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          {field.label}
                        </span>
                      </div>
                      <div className={`grid ${gridCols}`}>
                        {selectedProperties.map((prop, pIdx) => {
                          const course = prop.courses?.find(
                            (c: PropertyCourseProps) =>
                              c.course_name === selectedCourseId
                          );
                          let displayValue = "Not Available";
                          if (course) {
                            switch (field.key) {
                              case "Course Name":
                                displayValue = course.course_name || "N/A";
                                break;
                              case "Short Name":
                                displayValue =
                                  course.course_short_name || "N/A";
                                break;
                              case "Duration":
                                displayValue = course.duration || "N/A";
                                break;
                              case "Course Type":
                                displayValue = course.course_type || "N/A";
                                break;
                              case "Course Level":
                                displayValue = course.course_level || "N/A";
                                break;
                              case "Certification Type":
                                displayValue =
                                  course.certification_type || "N/A";
                                break;
                              case "Course Format":
                                displayValue = course.course_format || "N/A";
                                break;
                            }
                          }
                          return (
                            <div
                              key={pIdx}
                              className={`p-3 text-center text-sm border-(--border) ${
                                pIdx < selectedProperties.length - 1
                                  ? "border-r"
                                  : ""
                              }`}
                            >
                              {displayValue}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-(--primary-bg) text-(--text-color)">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-custom">
                <LuBookOpen size={24} />
              </div>
              <h3 className="sub-heading font-semibold mb-2">
                No Courses Available
              </h3>
              <p>No courses available for comparison</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
