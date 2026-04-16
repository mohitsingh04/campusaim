import React from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { API } from "../../services/API";
import ViewNicheSkeleton from "./Skeleton/ViewNicheSkeleton";

/* =========================
   API
========================= */

const fetchNiche = async (slug) => {
  if (!slug) throw new Error("Invalid slug");

  const { data } = await API.get(`/niche/${slug}/get`);
  return data;
};

/* =========================
   COMPONENT
========================= */

export default function ViewNiche() {
  const { slug } = useParams();

  /* =========================
     FETCH NICHE
  ========================== */

  const {
    data: niche,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["niche", slug],
    queryFn: () => fetchNiche(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    onError: () => {
      toast.error("Failed to fetch niche");
    },
  });

  if (isLoading) return <ViewNicheSkeleton />;

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load niche
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}

      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Niche", to: "/dashboard/niche/all" },
          { label: "View" },
          { label: niche?.name, active: true },
        ]}
        actions={[
          {
            label: "Edit",
            to: `/dashboard/niche/edit/${slug}`,
            Icon: Pencil,
            variant: "success",
          },
          {
            label: "Back",
            to: "/dashboard/niche/all",
            Icon: ArrowLeft,
            variant: "primary",
          },
        ]}
      />

      {/* Body */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Niche Details
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Read-only view of niche information
          </p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Name */}

          <Field label="Name">
            <p className="text-base font-semibold text-gray-900">
              {niche?.name || "-"}
            </p>
          </Field>

          {/* Slug */}

          <Field label="Slug">
            <p className="text-sm text-gray-800 bg-gray-50 inline-block px-3 py-1 rounded-md">
              {niche?.slug}
            </p>
          </Field>

          {/* Description */}

          <Field label="Description">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {niche?.description || "—"}
            </p>
          </Field>

          {/* Status */}

          <Field label="Status">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                ${niche?.status === "active" && "bg-green-100 text-green-700"}
                ${niche?.status === "inactive" && "bg-red-100 text-red-700"}
                ${niche?.status === "pending" && "bg-yellow-100 text-yellow-700"}
              `}
            >
              {niche?.status?.charAt(0).toUpperCase() +
                niche?.status?.slice(1)}
            </span>
          </Field>

          {/* Meta */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <Field label="Created At">
              <p className="text-sm text-gray-800">
                {niche?.createdAt
                  ? new Date(niche.createdAt).toLocaleString()
                  : "-"}
              </p>
            </Field>

            {niche?.createdBy && (
              <Field label="Created By">
                <p className="text-sm text-gray-800">
                  {niche.createdBy?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {niche.createdBy?.email}
                </p>
                <p className="text-sm text-gray-600">
                  {niche.createdBy?.role}
                </p>
              </Field>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   FIELD COMPONENT
========================= */

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}