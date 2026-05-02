import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import *as Yup from "yup";
import toast from "react-hot-toast";

import { API } from "../../services/API";
import EditNicheSkeleton from "./Skeleton/EditNicheSkeleton";
import FormSelect from "../../components/ui/Form/FormSelect";
import FormTextarea from "../../components/ui/Form/FormTextarea";

/* ======================
   VALIDATION
====================== */
const validationSchema = Yup.object({
  status: Yup.string().required("Status is required"),
  description: Yup.string().nullable(),
});

/* ======================
   COMPONENT
====================== */
export default function EditNiche() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [niche, setNiche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ======================
     FETCH NICHE
  ====================== */
  useEffect(() => {
    const fetchNiche = async () => {
      try {
        if (!id) return;

        const { data } = await API.get(`/niche/${id}`);
        setNiche(data);

      } catch (error) {
        toast.error("Failed to fetch niche");
      } finally {
        setLoading(false);
      }
    };

    fetchNiche();
  }, [id]);

  /* ======================
     FORM
  ====================== */
  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      name: niche?.name || "", // read-only
      description: niche?.description || "",
      status: niche?.status || "active",
    },

    validationSchema,

    onSubmit: async (values) => {
      try {
        setSubmitting(true);

        // ✅ DO NOT send name
        const payload = {
          description: values.description,
          status: values.status,
        };

        const { data } = await API.put(`/niche/${id}`, payload);

        toast.success(data?.message || "Niche updated successfully");

        navigate("/dashboard/niche/all");

      } catch (error) {
        toast.error(error?.response?.data?.error || "Something went wrong!");
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (loading) return <EditNicheSkeleton />;

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
          { label: "Edit" },
          { label: niche?.name, active: true },
        ]}
        actions={[
          {
            label: "Back",
            to: "/dashboard/niche/all",
            Icon: ArrowLeft,
            variant: "primary",
          },
        ]}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={formik.handleSubmit} className="space-y-6">

          <h2 className="text-lg font-semibold text-gray-900">
            Edit Niche
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* ✅ CATEGORY (READ ONLY) */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">
                Category
              </label>
              <input
                value={formik.values.name}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            {/* ✅ STATUS */}
            <FormSelect
              label="Status"
              name="status"
              formik={formik}
              options={[
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "inactive", label: "Inactive" },
              ]}
            />

          </div>

          {/* ✅ DESCRIPTION */}
          <FormTextarea
            label="Description"
            name="description"
            rows={6}
            placeholder="Description!"
            formik={formik}
          />

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {submitting ? "Updating..." : "Update"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}