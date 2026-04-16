import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { API } from "../../services/API";
import { ArrowLeft, Eye, Pencil } from "lucide-react";
import ViewQuestionSkeleton from "./Skeleton/ViewQuestionSkeleton";

const SCORE_OPTIONS = [
  { label: "Positive", value: 1 },
  { label: "Neutral", value: 0 },
  { label: "Negative", value: -1 },
];

export default function ViewQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    (async () => {
      try {
        setIsLoading(true);
        const res = await API.get(`/questions/${id}/view`);
        if (mounted) setQuestion(res.data?.data || null);
      } catch (error) {
        console.error("ViewQuestion:", error);
        toast.error("Failed to load question");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (<ViewQuestionSkeleton />);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Questions", to: "/dashboard/questions/all" },
          { label: "View", to: "/dashboard/questions/all" },
          { label: `${question?.title}`, active: true },
        ]}
        actions={[
          {
            label: "Edit",
            to: `/dashboard/questions/edit/${question?._id}`,
            Icon: Pencil,
            variant: "success",
          },
          {
            label: "Back",
            to: "/dashboard/questions/all",
            Icon: ArrowLeft,
            variant: "primary",
          },
        ]}
      />

      <div className="bg-white border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <Eye className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Question Details</h2>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-600">Title</label>
          <p className="mt-1 text-gray-900 font-medium">
            {question.title || "N/A"}
          </p>
        </div>

        {/* Question Text */}
        <div>
          <label className="text-sm font-medium text-gray-600">
            Question Text
          </label>
          <p className="mt-1 text-gray-900">
            {question.questionText || "N/A"}
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium text-gray-600">Status</label>
          <p className="mt-1 text-gray-900 capitalize">
            {question.status || "inactive"}
          </p>
        </div>

        {/* Order */}
        <div>
          <label className="text-sm font-medium text-gray-600">Order</label>
          <p className="mt-1 text-gray-900">
            {Number.isFinite(question.order) ? question.order : 0}
          </p>
        </div>

        {/* Options */}
        <div>
          <label className="text-sm font-medium text-gray-600">Options</label>
          <div className="mt-2 space-y-2">
            {Array.isArray(question.options) && question.options.length > 0 ? (
              question.options.map((opt, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border rounded px-4 py-2 bg-gray-50"
                >
                  <span className="font-medium text-gray-900">
                    {opt.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {SCORE_OPTIONS.find(s => s.value === opt.point)?.label || "Unknown"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No options available</p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Created At
            </label>
            <p className="mt-1 text-gray-900">
              {question.createdAt
                ? new Date(question.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Updated At
            </label>
            <p className="mt-1 text-gray-900">
              {question.updatedAt
                ? new Date(question.updatedAt).toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
