import { stripHtmlAndLimit } from "@/contexts/Callbacks";
import { HiringProps } from "@/types/types";
import Link from "next/link";
import React from "react";
import {
  LuBadgeIndianRupee,
  LuBookOpen,
  LuCalendar,
  LuGraduationCap,
  LuUsers,
} from "react-icons/lu";

const HiringCard = ({ job }: { job: HiringProps }) => {
  return (
    <div className="bg-white shadow-sm hover:shadow-purple-300 transition rounded-xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <Link
          href={`${process.env.NEXT_PUBLIC_CAREER_URL}/${job?.title
            ?.toLowerCase()
            ?.replace(/[^a-z0-9\s-]/g, "")
            ?.replace(/\s+/g, "-")
            ?.replace(/-+/g, "-")}/${job?._id}`}
          target="_blank"
        >
          <h3 className="text-xl font-bold text-purple-800">
            {job.title || "Job Title"}
          </h3>
        </Link>
        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
          {job?.job_type}
        </span>
      </div>

      <p className="text-sm text-gray-700">
        {stripHtmlAndLimit(job?.job_description, 100)}
      </p>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <LuUsers size={16} /> {job?.experience}
        </div>
        <div className="flex items-center gap-1">
          <LuBadgeIndianRupee size={16} />
          <div className="space-x-1">
            <span>{job?.salary?.INR}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <LuCalendar size={16} /> Apply end:{" "}
          {new Date(job?.end_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div>
        <h4 className="flex items-center gap-1 font-semibold text-sm mb-4 text-gray-800">
          <LuBookOpen size={16} /> Skills
        </h4>
        <div className="flex flex-wrap gap-2">
          {job?.skills?.map((skill, idx) => (
            <span
              key={idx}
              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="flex items-center gap-1 font-semibold text-sm mb-3 text-gray-800">
          <LuGraduationCap size={16} /> Qualifications
        </h4>
        <div className="flex flex-wrap gap-2">
          {job?.qualification?.map((q, idx) => (
            <span
              key={idx}
              className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium"
            >
              {q}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Page
const HiringTab = ({ hiring }: { hiring: HiringProps[] }) => {
  return (
    <div className="px-0 md:px-4 md:py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-purple-800">
          Join Our Yoga Institute
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
          {"We're"} seeking skilled yoga professionals to help guide students
          through wellness, mindfulness, and transformation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {hiring?.map((job, idx) => (
          <HiringCard key={idx} job={job} />
        ))}
      </div>
    </div>
  );
};

export default HiringTab;
