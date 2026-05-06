import React from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { API } from "../../../services/API";
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import { ArrowLeft, Pencil } from "lucide-react";
import ViewQuestionSetSkeleton from "./Skeleton/ViewQuestionSetSkeleton";
import { useQuery } from "@tanstack/react-query";

/* =========================
   API FUNCTION
========================= */

const fetchQuestionSet = async (id) => {
  const { data } = await API.get(`/question-set/${id}`);
  return data;
};

export default function ViewQuestionSet() {
  const navigate = useNavigate();
  const { id } = useParams();

  /* =========================
     FETCH QUESTION
  ========================== */

  const {
    data: questionSet,
    isLoading,
  } = useQuery({
    queryKey: ["question-set", id],
    queryFn: () => fetchQuestionSet(id),
    enabled: !!id,
    onError: () => {
      toast.error("Failed to fetch Question");
    },
  });

  const statusStyles = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  const statusLabels = {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
  };

  if (isLoading) return <ViewQuestionSetSkeleton />;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Question Set", to: "/dashboard/question-set/all" },
          { label: "View", to: "/dashboard/question-set/all" },
          { label: `${questionSet?.title}`, active: true },
        ]}
        actions={[
          {
            label: "Edit",
            to: `/dashboard/question-set/edit/${id}`,
            Icon: Pencil,
            variant: "success",
          },
          {
            label: "Back",
            to: "/dashboard/question-set/all",
            Icon: ArrowLeft,
            variant: "primary",
          },
        ]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Question Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Overview and configuration of this question
          </p>
        </div>

        <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Title</label>
            <p className="text-base font-semibold text-gray-900">
              {questionSet?.title || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Slug</label>
            <p className="text-sm text-gray-800 bg-gray-50 inline-block px-3 py-1 rounded-md">
              {questionSet?.slug || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Order</label>
            <p className="text-sm text-gray-800">
              {questionSet?.order ?? "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <br />
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[questionSet?.isActive] ||
                "bg-gray-100 text-gray-700"
                }`}
            >
              {statusLabels[questionSet?.isActive] || "Unknown"}
            </span>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">
              Question Text
            </label>
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {questionSet?.questionText || "—"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Niche</label>
            <p className="text-sm text-gray-800">
              {questionSet?.nicheId?.name || questionSet?.nicheId || "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Created At
            </label>
            <p className="text-sm text-gray-800">
              {questionSet?.createdAt
                ? new Date(questionSet.createdAt).toLocaleString()
                : "-"}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">
              Updated At
            </label>
            <p className="text-sm text-gray-800">
              {questionSet?.updatedAt
                ? new Date(questionSet.updatedAt).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Options</h3>
          <p className="text-sm text-gray-500">
            Available response options for this question
          </p>
        </div>

        <div className="px-6 py-6">
          {questionSet?.options?.length > 0 ? (
            <div className="space-y-3">
              {questionSet.options.map((opt, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {opt.label}
                    </p>
                  </div>

                  <span className="text-xs px-2 py-1 rounded-full font-semibold bg-blue-100 text-blue-700">
                    {opt.action}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No options available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}