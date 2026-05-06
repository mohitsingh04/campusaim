"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { HeadingProps } from "@/ui/headings/MainHeading";
import AcademicTypeSkeleton from "@/ui/loader/page/landing/_components/AcademicTypeSkeleton";
import {
  Backpack,
  GraduationCapIcon,
  SchoolIcon,
  UniversityIcon,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import API from "@/context/API";

export default function CategorySection() {
  const { data: propertyCounts, isLoading } = useQuery({
    queryKey: ["property-category-counts"],
    queryFn: async () => {
      const response = await API.get(`/property/counts/category`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const statsData = useMemo(() => {
    if (!propertyCounts) return [];
    return [
      {
        value: propertyCounts["school"] || 0,
        description:
          "Explore top-rated schools offering quality education, academic excellence, co-curricular activities, and strong foundations for student growth and success.",
        label: "School",
        icon: SchoolIcon,
        href: "/schools",
        colors: {
          sub: "bg-(--gray-subtle)",
          emphasis: "bg-(--gray-emphasis)",
          text: "text-(--gray-emphasis)",
          textSub: "text-(--gray-subtle)",
        },
      },
      {
        value: propertyCounts["college"] || 0,
        description:
          "Find the best colleges with industry-focused courses, experienced faculty, practical learning opportunities, and career-oriented programs for students.",
        label: "College",
        icon: GraduationCapIcon,
        colors: {
          sub: "bg-(--purple-subtle)",
          emphasis: "bg-(--purple-emphasis)",
          text: "text-(--purple-emphasis)",
          textSub: "text-(--purple-subtle)",
        },
        href: "/colleges",
      },
      {
        value: propertyCounts["university"] || 0,
        description:
          "Discover recognized universities offering undergraduate, postgraduate, diploma, and professional programs with modern campus facilities and academic support.",
        label: "University",
        icon: UniversityIcon,
        colors: {
          sub: "bg-(--danger-subtle)",
          emphasis: "bg-(--danger-emphasis)",
          text: "text-(--danger-emphasis)",
          textSub: "text-(--danger-subtle)",
        },
        href: "/universities",
      },
      {
        value: propertyCounts["coaching"] || 0,
        description:
          "Browse leading coaching institutes for competitive exams, entrance preparation, skill development, and career-focused training programs across multiple fields.",
        label: "Coaching Institutes",
        icon: Backpack,
        colors: {
          sub: "bg-(--warning-subtle)",
          emphasis: "bg-(--warning-emphasis)",
          text: "text-(--warning-emphasis)",
          textSub: "text-(--warning-subtle)",
        },
        href: "/coachings",
      },
    ];
  }, [propertyCounts]);

  if (isLoading || statsData.length === 0) return <AcademicTypeSkeleton />;

  return (
    <section className="relative bg-(--primary-bg) py-10 px-4 sm:px-8 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
        <HeadingProps
          tag="Explore Top Educational Categories"
          title="Browse by "
          activetitle="Academic Type"
          subtitle="Find trusted institutes for better learning and career growth."
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {statsData.map((item) => (
          <CategoryCard key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

const CategoryCard = React.memo(({ item }: { item: any }) => {
  const Icon = item.icon;

  return (
    <Link
      href={item?.href}
      title={item?.label}
      className="group rounded-custom p-5 bg-(--secondary-bg) shadow-xs hover:shadow-md transition-all duration-200 flex flex-col gap-3 h-full outline-none"
    >
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-custom flex items-center justify-center transition-colors duration-200 
          ${item.colors.emphasis} ${item.colors.textSub} 
          group-hover:${item.colors.sub} group-hover:${item.colors.text}`}
        >
          <div className="border border-current/20 rounded-custom p-0.5 flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-(--text-color-emphasis)">
        <h3 className="text-sm font-semibold truncate pr-2">{item.label}</h3>
        <div className="text-sm font-bold tabular-nums">{item.value}+</div>
      </div>

      <p className="text-xs text-(--text-color) line-clamp-3 leading-relaxed">
        {item.description}
      </p>
    </Link>
  );
});

CategoryCard.displayName = "CategoryCard";
