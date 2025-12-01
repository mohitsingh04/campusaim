import { TeacherProps } from "@/types/types";
import Image from "next/image";
import React from "react";
import { LuMapPin, LuClock } from "react-icons/lu";

export default function TeachersTab({
  teachers,
}: {
  teachers: TeacherProps[];
}) {
  return (
    <section className="p-6">
      {/* Teacher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-7xl mx-auto">
        {teachers.map((teacher, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-xs overflow-hidden hover:shadow-sm transition-shadow duration-300"
          >
            {/* Image */}
            <div className="relative w-full h-72 overflow-hidden rounded-lg">
              <Image
                src={
                  teacher.profile?.[0]
                    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${teacher?.profile?.[0]}`
                    : "/img/default-images/yp-user.webp"
                }
                alt={teacher.teacher_name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {teacher.teacher_name}
              </h3>
              <div className="flex items-center text-gray-600 mt-3 text-sm">
                <LuMapPin className="h-4 w-4 mr-2 text-purple-500" />
                {teacher.designation}
              </div>
              <div className="flex items-center text-gray-600 mt-3 text-sm">
                <LuClock className="h-4 w-4 mr-2 text-purple-500" />
                {teacher.experience}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
