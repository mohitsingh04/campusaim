import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import toast from "react-hot-toast";

import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { API } from "../../services/API";
import ViewNicheSkeleton from "./Skeleton/ViewNicheSkeleton";

/* =========================
   COMPONENT
========================= */

export default function ViewNiche() {

  const { id } = useParams(); // ✅ use id instead of slug

  const [niche, setNiche] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH NICHE
  ========================= */

  useEffect(() => {
    const fetchNiche = async () => {
      try {
        if (!id) return;

        const { data } = await API.get(`/niche/${id}`); // ✅ ID API
        setNiche(data);

      } catch (error) {
        toast.error("Failed to fetch niche");
      } finally {
        setLoading(false);
      }
    };

    fetchNiche();
  }, [id]);

  if (loading) return <ViewNicheSkeleton />;

  if (!niche) {
    return (
      <div className="p-6 text-center text-red-500">
        Niche not found
      </div>
    );
  }

  return (
    <div className="space-y-6">

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
            to: `/dashboard/niche/edit/${niche._id}`, // ✅ fixed
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

          <Field label="Name">
            <p className="text-base font-semibold text-gray-900">
              {niche?.name || "-"}
            </p>
          </Field>

          <Field label="Slug">
            <p className="text-sm text-gray-800 bg-gray-50 inline-block px-3 py-1 rounded-md">
              {niche?.slug}
            </p>
          </Field>

          <Field label="Description">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {niche?.description || "—"}
            </p>
          </Field>

          <Field label="Status">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
${niche?.status === "active" && "bg-green-100 text-green-700"}
${niche?.status === "inactive" && "bg-red-100 text-red-700"}
${niche?.status === "pending" && "bg-yellow-100 text-yellow-700"}
`}>
              {niche?.status?.charAt(0).toUpperCase() + niche?.status?.slice(1)}
            </span>
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
            <Field label="Created At">
              <p className="text-sm text-gray-800">
                {niche?.createdAt
                  ? new Date(niche.createdAt).toLocaleString()
                  : "-"}
              </p>
            </Field>
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