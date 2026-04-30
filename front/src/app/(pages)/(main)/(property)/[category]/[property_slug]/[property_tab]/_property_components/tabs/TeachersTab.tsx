"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseIcon,
  GraduationCapIcon,
  HistoryIcon,
  UserIcon,
} from "lucide-react";
import Image from "next/image";
import API from "@/context/API";
import { getErrorResponse } from "@/context/Callbacks";
import { PropertyProps, PropertyTeacherProps } from "@/types/PropertyTypes";
import TabLoading from "@/ui/loader/component/TabLoading";

export default function TeachersTab({
  property,
}: {
  property: PropertyProps | null;
}) {
  const { data: teachers, isLoading } = useQuery<PropertyTeacherProps[]>({
    queryKey: ["property-teacher", property?._id],
    queryFn: async () => {
      if (!property?._id) return [];
      try {
        const response = await API.get(`/teacher/property/${property._id}`);
        return response.data || [];
      } catch (error) {
        getErrorResponse(error, true);
        throw error;
      }
    },
    enabled: !!property?._id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <TabLoading />;

  if (!teachers || teachers.length === 0) {
    return (
      <div className="p-12 text-center bg-(--secondary-bg) rounded-custom border border-dashed border-(--border)">
        <UserIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p className="text-(--text-color-light)">
          Faculty information is not currently listed.
        </p>
      </div>
    );
  }

  return (
    <section className="p-6 w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {teachers.map((teacher, index) => (
          <div
            key={index}
            className="group relative bg-(--secondary-bg) rounded-custom overflow-hidden shadow-custom aspect-3/4"
          >
            <Image
              src={
                teacher.profile?.[0]
                  ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${teacher?.profile?.[0]}`
                  : "/img/default-images/yp-user.webp"
              }
              alt={teacher.teacher_name}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent z-10" />

            <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white flex flex-col justify-end">
              <div className="mb-3">
                <h3 className="text-base font-bold line-clamp-1">
                  {teacher.teacher_name}
                </h3>
                <p className="text-(--main-light) text-xs font-medium flex items-center gap-1.5 mt-0.5 opacity-90">
                  <BriefcaseIcon size={12} />
                  {teacher.designation}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <GraduationCapIcon size={14} className="opacity-70" />
                  <span className="text-xs font-medium line-clamp-1">
                    {teacher.department}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <HistoryIcon size={14} className="opacity-70" />
                  <span className="text-xs font-medium">
                    {teacher.experience} Experience
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
