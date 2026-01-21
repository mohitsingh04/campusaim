"use client";

import { useMemo, useCallback } from "react";
import { generateSlug } from "@/context/Callbacks";
import { PropertyProps } from "@/types/PropertyTypes";
import { CourseProps, EventProps } from "@/types/Types";
import { BlogsProps } from "@/types/BlogTypes";
import { NewsProps } from "@/types/NewsTypes";

export default function useSearchFilter({
  properties = [],
  courses = [],
  blogs = [],
  events = [],
  news = [],
  keywordsList = [],
  query = "",
  localSearch = "",
}: {
  properties?: PropertyProps[];
  courses?: CourseProps[];
  blogs?: BlogsProps[];
  events?: EventProps[];
  news?: NewsProps[];
  keywordsList?: string[];
  query?: string;
  localSearch?: string;
}) {
  const lowerQuery = generateSlug(query || "");
  const lowerLocal = generateSlug(localSearch || "");

  const matchBoth = useCallback(
    (value: string) => {
      const slug = generateSlug(value);

      if (lowerQuery && !slug.includes(lowerQuery)) return false;
      if (lowerLocal && !slug.includes(lowerLocal)) return false;
      return true;
    },
    [lowerQuery, lowerLocal]
  );

  const filteredProps = useMemo(() => {
    return properties.filter((p) =>
      matchBoth(
        [
          p.property_name,
          p.category,
          p.property_type,
          p.property_city,
          p.property_state,
          p.property_country,
        ].join(" ")
      )
    );
  }, [properties, matchBoth]);

  const filteredKeywords = useMemo(() => {
    return keywordsList.filter((p) => matchBoth([p].join(" ")));
  }, [keywordsList, matchBoth]);

  const filteredCourses = useMemo(
    () =>
      courses.filter((c) =>
        matchBoth(
          [
            c.course_name,
            c.course_short_name,
            c.course_type,
            c.course_level,
            c.certification_type,
          ].join(" ")
        )
      ),
    [courses, matchBoth]
  );

  const filteredEvents = useMemo(
    () => events.filter((e) => matchBoth(e.title || "")),
    [events, matchBoth]
  );

  const filteredBlogs = useMemo(
    () =>
      blogs.filter((b) =>
        matchBoth([b.title, ...(b.category || []), ...(b.tags || [])].join(" "))
      ),
    [blogs, matchBoth]
  );

  const filteredNews = useMemo(
    () => news.filter((n) => matchBoth(n.title || "")),
    [news, matchBoth]
  );

  return {
    finalProps: filteredProps,
    finalCourses: filteredCourses,
    finalBlogs: filteredBlogs,
    finalEvents: filteredEvents,
    finalNews: filteredNews,
    finalKeywords: filteredKeywords,
  };
}
