import { useEffect, useState } from "react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { API } from "../../contexts/API";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  CheckCircle,
  HelpCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { formatDate, formatDateWithoutTime } from "../../contexts/Callbacks";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";
import { FAQProps } from "../../types/types";

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
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
              {/* FAQ Section */}
              {news?.faqs && news.faqs.length > 0 && (
                <div className="mt-5 space-y-4">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--yp-text-primary)] mb-4">
                    <HelpCircle className="text-[var(--yp-main)]" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-3">
                    {news.faqs.map((faq: FAQProps, index: number) => (
                      <div
                        key={index}
                        className="border border-[var(--yp-border-primary)] rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setOpenFaqIndex(
                              openFaqIndex === index ? null : index,
                            )
                          }
                          className="w-full flex items-center justify-between p-4 text-left bg-[var(--yp-input-primary)] hover:bg-[var(--yp-secondary)] transition-colors"
                        >
                          <span className="font-medium text-[var(--yp-text-primary)]">
                            {faq.question}
                          </span>
                          {openFaqIndex === index ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                        {openFaqIndex === index && (
                          <div className="p-4 border-t border-[var(--yp-border-primary)] bg-[var(--yp-primary)]">
                            <div
                              className="text-sm text-[var(--yp-text-secondary)] prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
