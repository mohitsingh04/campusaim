import { useEffect, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { formatDate, formatDateWithoutTime } from "../../contexts/Callbacks";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";

const MetaDetail = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-start space-x-3 text-sm">
    <Icon className="w-5 h-5 text-[var(--yp-main)] flex-shrink-0 mt-0.5" />
    <div className="flex flex-col">
      <span className="font-semibold text-[var(--yp-muted)]">{label}</span>
      <span className="text-[var(--yp-muted)]">{value}</span>
    </div>
  </div>
);

export default function NewsView() {
  const { objectId } = useParams();
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await API.get(`/news-and-updates/${objectId}`);
        setNews(data);
      } catch (error) {
        toast.error("Failed to load news details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [objectId]);

  if (loading) {
    return <ViewSkeleton />;
  }

  return (
    <div>
      <Breadcrumbs
        title="News and Updates"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "News & Updates", path: "/dashboard/news-and-updates" },
          { label: news?.title || "View" },
        ]}
      />

      <div className="mx-auto mt-8">
        <div className="bg-[var(--yp-primary)] rounded-2xl shadow-sm overflow-hidden">
          {/* Immersive Header Section */}
          <div className="relative w-full h-96">
            <img
              src={
                news?.featured_image?.[0]
                  ? `${import.meta.env.VITE_MEDIA_URL}/news-and-updates/${
                      news.featured_image[0]
                    }`
                  : "/img/default-images/yp-news.webp"
              }
              alt={news?.title || "News Featured Image"}
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay for text readability and Title */}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-8">
              <div className="max-w-5xl">
                <h1 className="text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                  {news?.title || "Untitled News Article"}
                </h1>
              </div>
            </div>
          </div>

          <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3 lg:order-1">
              <ReadMoreLess children={news?.content} />
            </div>

            <div className="lg:col-span-1 lg:order-2">
              <div className="lg:sticky lg:top-8 bg-[var(--yp-secondary)] p-6 rounded-xl shadow-inner space-y-6">
                <h2 className="text-xl font-bold text-[var(--yp-main)] pb-2">
                  Article Status
                </h2>
                <div className="space-y-5">
                  {/* Published Date */}
                  {news?.publish_date && (
                    <MetaDetail
                      icon={Calendar}
                      label="Published Date"
                      value={formatDateWithoutTime(news.publish_date)}
                    />
                  )}
                  {/* Status */}
                  {news?.status && (
                    <MetaDetail
                      icon={CheckCircle}
                      label="Status"
                      value={news.status}
                    />
                  )}
                  {/* Created Date */}
                  {news?.createdAt && (
                    <MetaDetail
                      icon={Clock}
                      label="Record Created"
                      value={formatDate(news.createdAt)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
