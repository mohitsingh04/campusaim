import { SearchResult } from "@/types/Types";
import PropertyCard from "./PropertyCard";
import CourseCard from "./CourseCard";
import BlogCard from "./BlogCard";
import EventCard from "./EventCard";
import NewsCard from "./NewsCard";
import KeywordCard from "./KeywordCard";

export default function SearchList({ results }: { results: SearchResult[] }) {
  return (
    <div className="space-y-4">
      {results.map((item, i) => {
        if (item.type === "property")
          return <PropertyCard key={i} property={item} />;
        if (item.type === "course") return <CourseCard key={i} course={item} />;
        if (item.type === "blog") return <BlogCard key={i} blog={item} />;
        if (item.type === "events") return <EventCard key={i} event={item} />;
        if (item.type === "queries")
          return <KeywordCard key={i} keyword={item} />;
        if (item.type === "news-and-updates")
          return <NewsCard key={i} news={item} />;
        return null;
      })}
    </div>
  );
}
