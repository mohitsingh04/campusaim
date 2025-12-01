import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import { useParams } from "react-router-dom";
import { API } from "../../contexts/API";
import { formatDate, getErrorResponse } from "../../contexts/Callbacks";
import { UserProps } from "../../types/types";
import ViewSkeleton from "../../ui/skeleton/ViewSkeleton";
import Badge from "../../ui/badge/Badge";
import ReadMoreLess from "../../ui/read-more/ReadMoreLess";
import { FeedbackData } from "../../common/FeedbackData";

export default function FeedbackView() {
  const { objectId } = useParams();
  const [feedback, setFeedback] = useState<any>(null);
  const [user, setUser] = useState<UserProps | null>(null);
  const [loading, setLoading] = useState(true);

  const getFeedback = useCallback(async () => {
    try {
      const response = await API.get(`/feedback/${objectId}`);
      setFeedback(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [objectId]);

  useEffect(() => {
    getFeedback();
  }, [getFeedback]);

  const getUser = useCallback(async () => {
    if (!feedback?.userId) return;
    setLoading(true);
    try {
      const response = await API.get(
        `/profile/user/uniqueId/${feedback.userId}`
      );
      setUser(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [feedback?.userId]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  if (loading) {
    return <ViewSkeleton />;
  }

  const rating = FeedbackData.find((r) => r.label === feedback.reaction);
  return (
    <div>
      <Breadcrumbs
        title="Feedback"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "Feedback", path: "/dashboard/feedbacks" },
          { label: user?.name || "" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[var(--yp-border-primary)] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[var(--yp-text-primary)] tracking-tight">
              {user?.name}
            </h2>
            <div className="flex items-center gap-2 text-[var(--yp-muted)] text-sm mt-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(feedback?.createdAt)}</span>
            </div>
          </div>
          <Badge label="Feedback" color="blue" />
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center text-center bg-[var(--yp-secondary)] rounded-xl p-8 shadow-inner">
            <div
              className={`p-2 rounded-full shadow-inner ${
                rating ? rating.bg : "bg-[var(--yp-muted)]"
              }`}
            >
              {rating && (
                <rating.icon className={`w-10 h-10 ${rating.color}`} />
              )}
            </div>
            <p
              className={`mt-4 text-xl font-semibold ${
                rating ? rating.color : "text-[var(--yp-muted)]"
              }`}
            >
              {feedback.reaction}
            </p>
            <p className="text-sm text-[var(--yp-muted)] mt-1">
              User shared their feedback
            </p>
          </div>

          {/* Message Column */}
          <div className="flex flex-col justify-start bg-[var(--yp-secondary)] rounded-xl p-6 shadow-inner">
            <h3 className="font-semibold text-[var(--yp-text-primary)] mb-3">
              Message
            </h3>
            <ReadMoreLess children={feedback?.message} />
          </div>
        </div>
      </div>
    </div>
  );
}
