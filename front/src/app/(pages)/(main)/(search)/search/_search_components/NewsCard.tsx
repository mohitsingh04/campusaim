import { generateSlug } from "@/context/Callbacks";
import { NewsProps } from "@/types/NewsTypes";
import Link from "next/link";
import { BiNews } from "react-icons/bi";
import { BsNewspaper } from "react-icons/bs";

export default function NewsCard({ news }: { news: NewsProps }) {
  return (
    <section className="w-full">
      <div className="bg-(--primary-bg) text-(--text-color) p-4 sm:p-6 rounded-custom shadow-custom flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mt-2">
        <div className="flex items-center sm:items-start gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-(--main-light) text-(--main-emphasis) rounded-full flex items-center justify-center shrink-0">
            <BiNews className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <div className="flex flex-col">
            <Link
              href={`/news-and-updates/${generateSlug(news?.news_slug)}`}
              className="sub-heading font-semibold line-clamp-1"
            >
              {news?.title}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-end justify-end sm:justify-start">
          <BsNewspaper className="w-3 h-3 sm:w-6 sm:h-6" />
          <h3 className="text-xs sm:text-lg font-bold">News</h3>
        </div>
      </div>
    </section>
  );
}
