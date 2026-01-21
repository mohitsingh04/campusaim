import { PropertyTeacherProps } from "@/types/PropertyTypes";
import Image from "next/image";
import { LuClock, LuMapPin } from "react-icons/lu";

export default function TeachersTab({
  teachers,
}: {
  teachers: PropertyTeacherProps[];
}) {
  return (
    <section className="p-5 bg-(--primary-bg) text-(--text-color) w-full ">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl mx-auto">
        {teachers.map((teacher, index) => (
          <div
            key={index}
            className="bg-(--secondary-bg) rounded-custom shadow-custom overflow-hidden transition-shadow duration-300"
          >
            <div className="relative w-full aspect-square">
              <Image
                src={
                  teacher.profile?.[0]
                    ? `${process.env.NEXT_PUBLIC_MEDIA_URL}/${teacher?.profile?.[0]}`
                    : "/img/default-images/yp-user.webp"
                }
                alt={teacher.teacher_name}
                className="object-cover"
                fill
              />
            </div>

            <div className="p-4">
              <h3 className="sub-heading text-(--text-color-emphasis) font-semibold mb-1">
                {teacher.teacher_name}
              </h3>
              <div className="flex items-center paragraph">
                <LuMapPin className="h-4 w-4 mr-2 text-(--main)" />
                {teacher.designation}
              </div>
              <div className="flex items-center paragraph">
                <LuClock className="h-4 w-4 mr-2 text-(--main)" />
                {teacher.experience}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
