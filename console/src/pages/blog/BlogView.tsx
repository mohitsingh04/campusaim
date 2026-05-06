import { useCallback, useEffect, useState } from "react";
import { BlogProps, FAQProps, UserProps } from "../../types/types";
import { API } from "../../contexts/API";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import Badge from "../../ui/badge/Badge";
import {
  formatDate,
  generateSlug,
  getErrorResponse,
  getStatusColor,
} from "../../contexts/Callbacks";
import {
  Box,
  ExternalLink,
  Menu,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";

export default function BlogView() {
  const { objectId } = useParams();
  const [blog, setBlog] = useState<(BlogProps & { faqs?: FAQProps[] }) | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProps | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const getUser = useCallback(async () => {
    if (!blog?.author) return;
    try {
      const response = await API.get(`/profile/user/${blog.author}`);
      setUser(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [blog?.author]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  const getBlog = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/blog/${objectId}`);
      const data = response.data;
      setBlog(data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    getBlog();
  }, [getBlog]);

  if (loading) {
    return <ViewSkeleton />;
  }

  return (
    <div>
      <div className="space-y-5">
        {/* Breadcrumb */}
        <Breadcrumbs
          title="Blog"
          breadcrumbs={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Blog", path: `/dashboard/blog` },
            { label: blog?.title || "" },
          ]}
        />

        {/* Blog Header */}
        <div className="overflow-hidden rounded-xl shadow-sm bg-[var(--yp-primary)]">
          <img
            src={
              blog?.featured_image?.[0]
                ? `${import.meta.env.VITE_MEDIA_URL}/blogs/${
                    blog?.featured_image?.[0]
                  }`
                : "/img/default-images/yp-blogs.webp"
            }
            alt="Blog Cover"
            className="w-full aspect-[2/1] object-cover"
          />
          <div className="p-6">
            <div className="flex items-end gap-3 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--yp-text-primary)]">
                {blog?.title}
              </h1>
              <a
                href={`${import.meta.env.VITE_MAIN_URL}/blog/${generateSlug(
                  blog?.title || "",
                )}`}
                className="mb-1"
                title="View Blog"
                target="_blank"
              >
                <ExternalLink className="text-[var(--yp-main)]" />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge label={`Author: ${user?.name}`} color="blue" />
              <Badge
                label={`Status: ${blog?.status}`}
                color={getStatusColor(blog?.status || "")}
              />
              <Badge
                label={`Created: ${formatDate(blog?.createdAt || "")}`}
                color="yellow"
              />
            </div>
          </div>
        </div>

        {/* Blog Description */}
        <div
          id="blog-main"
          className="p-6 rounded-xl bg-[var(--yp-primary)] shadow-sm"
        >
          <ReadMoreLess children={blog?.blog || ""} />
        </div>

        {/* FAQ Section */}
        {blog?.faqs && blog.faqs.length > 0 && (
          <div className="p-6 rounded-xl bg-[var(--yp-primary)] shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--yp-text-primary)] mb-4">
              <HelpCircle className="text-[var(--yp-main)]" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-3">
              {blog.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-[var(--yp-border-primary)] rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === index ? null : index)
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

        {/* Tags & Categories */}
        <div className="p-6 rounded-xl bg-[var(--yp-primary)] shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--yp-text-primary)]">
                <Box />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {blog?.tags?.map((tag, i) => (
                  <Badge
                    label={
                      typeof tag === "object" ? (tag as any)?.blog_tag : tag
                    }
                    key={i}
                  />
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold text-[var(--yp-text-primary)] ">
                <Menu />
                Categories
              </h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {blog?.category?.map((cat, i: number) => (
                  <Badge
                    label={
                      typeof cat === "object"
                        ? (cat as any)?.blog_category
                        : cat
                    }
                    key={i}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
