"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { BiHelpCircle, BiHome } from "react-icons/bi";
import { FiEdit3 } from "react-icons/fi";
import {
  LuSettings,
  LuMapPin,
  LuStar,
  LuMessageCircle,
  LuMessageSquareDashed,
  LuInbox,
  LuClock,
  LuBookOpen,
  LuUsers,
  LuCalendar,
} from "react-icons/lu";
import Image from "next/image";
import Link from "next/link";
import { getProfile } from "@/context/getAssets";
import { UserProps } from "@/types/UserTypes";
import {
  formatDate,
  formatTime,
  getErrorResponse,
  getInitials,
  getStatusColor,
  getUserAvatar,
  stripHtmlAndLimit,
} from "@/context/Callbacks";
import Loading from "@/ui/loader/Loading";
import SettingsOffcanvas from "@/components/setting/SettingOffcanvas";
import { FaWpforms } from "react-icons/fa";
import API from "@/context/API";
import CountUp from "react-countup";
import { PropertyReviewProps } from "@/types/PropertyTypes";
import { formatDistanceToNow } from "date-fns";
import Badge from "@/ui/badge/Badge";
import { EnquiryReviewModal } from "./_profile_components/EnquiryReview";

function ReviewsContent({ reviews }: { reviews: PropertyReviewProps[] }) {
  const [visibleCount, setVisibleCount] = useState(10);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-(--primary-bg) rounded-custom shadow-custom animate-in fade-in duration-500 text-center">
        <div className="mb-4 bg-(--main-emphasis) text-(--main-light) rounded-full">
          <LuMessageSquareDashed size={48} />
        </div>

        <h3 className="text-(--text-color-emphasis) font-semibold text-lg mb-2">
          No reviews yet
        </h3>

        <p className="text-(--text-color) text-sm  mx-auto leading-relaxed mb-6">
          This property hasn&apos;t been rated yet. Be the first to share your
          experience and help others make the right choice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {reviews.slice(0, visibleCount).map((rev, i) => (
        <div key={i} className="bg-(--primary-bg) p-6 rounded-xl shadow-custom">
          <div className="flex items-center gap-1 text-(--warning) mb-3">
            {Array(rev?.rating || 0)
              .fill(true)
              .map((_, idx) => (
                <LuStar key={idx} size={14} fill="currentColor" />
              ))}
          </div>

          <p className="text-(--text-color) text-sm leading-relaxed italic">
            &quot;{rev?.review}&quot;
          </p>

          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-(--border)/50">
            <div className="w-10 h-10 rounded-full bg-(--main-emphasis) text-(--main-light) flex items-center justify-center shrink-0 mt-1">
              <span className="text-xs font-bold uppercase tracking-wide">
                {getInitials(rev?.name || "")}
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-(--text-color-emphasis)">
                {rev?.name}
              </p>
            </div>
          </div>
        </div>
      ))}

      {visibleCount < reviews.length && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 mt-2 rounded-custom bg-(--main-emphasis) text-(--main-light) font-medium text-sm hover:opacity-85 transition-colors"
        >
          Load More Reviews ({reviews.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

function QuestionsContent({ questions }: { questions: any[] }) {
  const [visibleCount, setVisibleCount] = useState(10);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-(--primary-bg) rounded-custom shadow-custom animate-in fade-in duration-500 text-center">
        <div className="mb-4 bg-(--main-emphasis) text-(--main-light) rounded-full">
          <BiHelpCircle size={48} />
        </div>
        <h3 className="text-(--text-color-emphasis) font-semibold text-lg mb-2">
          No questions yet
        </h3>
        <p className="text-(--text-color) text-sm mx-auto leading-relaxed mb-6 max-w-xs">
          There are no questions asked regarding this property yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {questions.slice(0, visibleCount).map((qst, idx) => (
        <div
          key={idx}
          className="bg-(--primary-bg) p-5 rounded-xl shadow-custom transition-shadow border border-transparent hover:border-(--border)/30"
        >
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 bg-(--main-emphasis) text-(--main-light) rounded-custom flex items-center justify-center">
              <BiHelpCircle size={22} />
            </div>

            <div className="flex-1">
              <h4 className="font-semibold text-(--text-color-emphasis) text-base mb-1">
                {qst?.title}
              </h4>

              <p className="text-(--text-color) text-sm leading-relaxed text-opacity-90">
                {stripHtmlAndLimit(qst?.description)}
              </p>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-(--border)/10 text-xs text-(--text-color-emphasis)">
                <span className="flex items-center gap-1">
                  <LuMessageCircle size={12} />
                  Asked{" "}
                  {qst?.createdAt
                    ? formatDistanceToNow(new Date(qst.createdAt), {
                        addSuffix: true,
                      })
                    : "recently"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {visibleCount < questions.length && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 mt-2 rounded-custom bg-(--main-emphasis) text-(--main-light) font-medium text-sm hover:opacity-85 transition-colors"
        >
          Load More Questions ({questions.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
function AnswersContent({ answers }: { answers: any[] }) {
  const [visibleCount, setVisibleCount] = useState(10);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  if (!answers || answers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-(--primary-bg) rounded-custom shadow-custom animate-in fade-in duration-500 text-center">
        <div className="mb-4 text-(--text-color-emphasis)">
          <LuMessageCircle size={48} />
        </div>
        <h3 className="text-(--text-color-emphasis) font-semibold text-lg mb-2">
          No answers yet
        </h3>
        <p className="text-(--text-color) text-sm mx-auto leading-relaxed mb-6 max-w-xs">
          You haven&apos;t provided any answers yet.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {answers.slice(0, visibleCount).map((ans, idx) => (
        <div
          key={idx}
          className="bg-(--primary-bg) p-5 rounded-xl shadow-custom transition-shadow border border-transparent hover:border-(--border)/30"
        >
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 bg-(--main-emphasis) text-(--main-light) rounded-custom flex items-center justify-center">
              <LuMessageCircle size={20} />
            </div>

            <div className="flex-1">
              <p className="text-(--text-color) text-sm leading-relaxed">
                &quot;{stripHtmlAndLimit(ans?.content)}&quot;
              </p>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-(--border)/10 text-xs text-(--text-color-emphasis)">
                <span className="flex items-center gap-1">
                  <LuClock size={12} />
                  Answered{" "}
                  {ans?.createdAt
                    ? formatDistanceToNow(new Date(ans.createdAt))
                    : "recently"}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {visibleCount < answers.length && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 mt-2 rounded-custom bg-(--main-emphasis) text-(--main-light) font-medium text-sm hover:opacity-85 transition-colors"
        >
          Load More Answers ({answers.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}
function EnquiriesContent({
  enquiries,
  profile,
  enquiryReviews,
}: {
  enquiries: any[];
  enquiryReviews: any[];
  profile: UserProps | null;
}) {
  const [visibleCount, setVisibleCount] = useState(10);
  const [isReviewModal, setIsReviewModal] = useState<any>(null);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const getReviewById = (id: string) => {
    return enquiryReviews?.find((it) => String(it?.enquiry_id) === String(id));
  };

  if (!enquiries || enquiries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 bg-(--primary-bg) rounded-custom shadow-custom animate-in fade-in duration-500 text-center">
        <div className="mb-4 text-(--text-color-emphasis)">
          <LuInbox size={48} />
        </div>
        <h3 className="text-(--text-color-emphasis) font-semibold text-lg mb-2">
          No enquiries yet
        </h3>
        <p className="text-(--text-color) text-sm mx-auto leading-relaxed mb-6 max-w-xs">
          You haven&apos;t received any enquiries yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {enquiries.slice(0, visibleCount).map((enq, i) => (
        <div
          key={i}
          className="bg-(--primary-bg) p-6 rounded-xl shadow-custom relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-(--main-emphasis) text-(--main-light) flex items-center justify-center shrink-0 mt-1">
                <span className="text-xs font-bold uppercase tracking-wide">
                  {getInitials(enq?.name || "")}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-(--text-color-emphasis)">
                  {enq?.name || "Anonymous User"}
                </p>

                {enq?.property_name && (
                  <div className="flex items-center gap-1.5 text-xs text-(--text-color)">
                    <BiHome size={12} />
                    <span>{enq.property_name}</span>
                  </div>
                )}

                {enq?.city && (
                  <div className="flex items-center gap-1.5 text-xs text-(--text-color)">
                    <LuMapPin size={12} />
                    <span>{enq.city}</span>
                  </div>
                )}
              </div>
            </div>

            {enq?.createdAt && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-custom shadow-custom text-xs font-medium bg-(--gray-subtle) text-(--gray-emphasis)">
                <LuClock size={12} />
                <span>
                  {formatDate(enq.createdAt)} | {formatTime(enq.createdAt)}
                </span>
              </div>
            )}
          </div>

          {/* Status + Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {enq?.status && (
              <Badge
                label={enq?.status}
                className="rounded-custom"
                color={getStatusColor(enq?.status)}
              />
            )}

            {enq?.preferred_course && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-custom shadow-custom text-xs font-medium bg-(--gray-subtle) text-(--gray-emphasis)">
                <LuBookOpen size={12} />
                {enq.preferred_course}
              </span>
            )}

            {enq?.people && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-custom shadow-custom text-xs font-medium bg-(--gray-subtle) text-(--gray-emphasis)">
                <LuUsers size={12} />
                {enq.people} People
              </span>
            )}
          </div>

          {enq?.message && (
            <div className="bg-(--secondary-bg)/30 p-3 rounded-lg border border-(--border)/30 mb-4">
              <p className="text-(--text-color) text-sm leading-relaxed">
                &quot;{enq.message}&quot;
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-(--border)/50">
            {enq?.date && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-custom shadow-custom text-xs font-medium bg-(--gray-subtle) text-(--gray-emphasis)">
                <LuCalendar size={14} />
                <span>Accepted for: {formatDate(enq.date)}</span>
              </div>
            )}

            <div />

            {enq?.status === "Suspended" && !getReviewById(enq?._id) && (
              <button
                onClick={() => setIsReviewModal(enq)}
                className="px-4 py-2 rounded-custom text-sm font-medium bg-(--main-emphasis) text-(--main-light) hover:opacity-85 transition"
              >
                Review
              </button>
            )}

            {isReviewModal && (
              <EnquiryReviewModal
                closeModal={() => setIsReviewModal(null)}
                profile={profile}
                enquiry={isReviewModal}
              />
            )}
          </div>
        </div>
      ))}

      {visibleCount < enquiries.length && (
        <button
          onClick={handleLoadMore}
          className="w-full py-3 mt-2 rounded-custom bg-(--main-emphasis) text-(--main-light) font-medium text-sm hover:opacity-85 transition-colors"
        >
          Load More Enquiries ({enquiries.length - visibleCount} remaining)
        </button>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [review, setReviews] = useState([]);
  const [enquires, setEnquiries] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [enquiryReviews, setEnquiryReviews] = useState([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTabId = searchParams.get("tab") ?? "your-reviews";

  const getProfileUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfileUser();
  }, [getProfileUser]);

  useEffect(() => {
    if (!profile && !loading) {
      router.push("/");
    }
  }, [router, profile, loading]);

  const getUserAssets = useCallback(async () => {
    if (!profile) return;
    try {
      const [
        followerRes,
        followingRes,
        reviewRes,
        enquiryRes,
        questionRes,
        answerRes,
        enqReviewRes,
      ] = await Promise.allSettled([
        API.get(`/follow/${profile?._id}/followers`),
        API.get(`/follow/${profile?._id}//following`),
        API.get(`/review/user/${profile?.uniqueId}`),
        API.get(`/enquiry/user/${profile?._id}`),
        API.get(`/questions/user/${profile?._id}`),
        API.get(`/answers/user/${profile?._id}`),
        API.get(`/enquiry/review/user/${profile?._id}`),
      ]);

      if (followerRes.status === "fulfilled") {
        setFollowers(followerRes.value?.data || []);
      }
      if (followingRes.status === "fulfilled") {
        setFollowing(followingRes.value?.data || []);
      }
      if (reviewRes.status === "fulfilled") {
        setReviews(reviewRes.value?.data || []);
      }
      if (enquiryRes.status === "fulfilled") {
        setEnquiries(enquiryRes.value?.data || []);
      }
      if (enqReviewRes.status === "fulfilled") {
        setEnquiryReviews(enqReviewRes.value?.data || []);
      }
      if (questionRes.status === "fulfilled") {
        setQuestions(questionRes.value?.data || []);
      }
      if (answerRes.status === "fulfilled") {
        setAnswers(answerRes.value?.data || []);
      }
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [profile]);

  useEffect(() => {
    getUserAssets();
  }, [getUserAssets]);

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const userStats = [
    { label: "Followers", value: followers?.length || 0 },
    { label: "Following", value: following?.length || 0 },
  ];

  const tabs = [
    // {
    //   id: "recommended-jobs",
    //   label: "Recommended Jobs",
    //   icon: <LuBriefcase size={16} />,
    //   tab: <JobsContent />,
    // },
    {
      id: "your-reviews",
      label: "Your Reviews",
      icon: <LuStar size={16} />,
      tab: <ReviewsContent reviews={review} />,
    },
    {
      id: "your-questions",
      label: "Your Questions",
      icon: <BiHelpCircle size={16} />,
      tab: <QuestionsContent questions={questions} />,
    },
    {
      id: "your-answers",
      label: "Your Answers",
      icon: <LuMessageCircle size={16} />,
      tab: <AnswersContent answers={answers} />,
    },
    {
      id: "your-enquiries",
      label: "Your Enquires",
      icon: <FaWpforms size={16} />,
      tab: (
        <EnquiriesContent
          enquiries={enquires}
          profile={profile}
          enquiryReviews={enquiryReviews}
        />
      ),
    },
  ];

  const location = [
    profile?.address,
    profile?.pincode,
    profile?.city,
    profile?.state,
    profile?.country,
  ]
    .filter((v) => v && String(v).trim())
    .join(", ");

  const activeTabContent = tabs.find((t) => t.id === currentTabId) || tabs[0];
  if (loading) return <Loading />;

  return (
    <>
      <SettingsOffcanvas
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
      />

      <div className="min-h-screen bg-(--secondary-bg) text-(--text-color)">
        <main className="mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Sidebar */}
            <aside className="md:col-span-4 lg:col-span-3">
              <div className="sticky top-16 flex flex-col gap-6 bg-(--primary-bg) shadow-custom p-5 rounded-custom">
                <div className="flex flex-row md:flex-col items-center md:items-start gap-5 md:gap-0 text-left">
                  <div className="w-full h-full flex-1/2">
                    <div className="w-20 h-20 md:w-36 md:h-36 rounded-custom border border-(--border) p-1 bg-(--secondary-bg) shadow-sm md:mb-3">
                      <div className="w-full h-full relative rounded-custom overflow-hidden bg-(--secondary-bg)">
                        <Image
                          src={getUserAvatar(profile?.avatar || [])}
                          alt={profile?.name || ""}
                          fill
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-(--text-color-emphasis)">
                      {profile?.name}
                    </h2>
                    <p className="text-(--text-color) text-base! font-medium mt-1">
                      @{profile?.username}
                    </p>
                    {location && (
                      <div className="flex items-start gap-1 text-xs text-(--text-color) mt-2 shrink-0">
                        <LuMapPin size={16} className="shrink-0" />
                        <span>{location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-y-4 border-y border-(--border) py-4">
                  {userStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-center p-1"
                    >
                      <span className="font-bold text-base md:text-lg text-(--text-color-emphasis)">
                        <CountUp end={stat?.value} />
                      </span>
                      <span className="text-[10px] md:text-xs text-(--text-color) uppercase tracking-wider font-medium text-center">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 w-full">
                  <Link
                    href={`/settings/account`}
                    className="flex-1 py-2.5 rounded-lg font-medium border border-(--border) text-(--text-color) bg-(--primary-bg) hover:bg-(--secondary-bg) flex items-center justify-center gap-2 text-sm"
                  >
                    <FiEdit3 size={16} /> Edit
                  </Link>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="px-3 py-2.5 rounded-lg border border-(--border) text-(--text-color) bg-(--primary-bg) hover:bg-(--secondary-bg) flex items-center justify-center"
                  >
                    <LuSettings size={20} />
                  </button>
                </div>
              </div>
            </aside>

            {/* Main Content Area */}
            <section className="md:col-span-8 lg:col-span-9">
              <div className="sticky top-16 z-4 bg-(--primary-bg) p-2 rounded-custom backdrop-blur-sm mb-4">
                <div className="flex w-full overflow-x-auto p-1 items-center gap-2 hide-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-1 px-4 py-2 text-xs cursor-pointer rounded-full shrink-0 ${
                        currentTabId === tab.id
                          ? "bg-(--main-emphasis) text-(--main-light)"
                          : "text-(--main-emphasis) bg-(--main-light) shadow-sm hover:opacity"
                      }`}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              {activeTabContent.tab}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
