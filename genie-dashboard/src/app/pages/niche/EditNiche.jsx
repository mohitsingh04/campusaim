import React from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { API } from "../../services/API";
import EditNicheSkeleton from "./Skeleton/EditNicheSkeleton";
import FormInput from "../../components/ui/Form/FormInput";
import { capitalizeWords } from "../../utils/format";
import FormSelect from "../../components/ui/Form/FormSelect";
import FormTextarea from "../../components/ui/Form/FormTextarea";

const fetchNiche = async (slug) => {
  if (!slug) throw new Error("Invalid slug");
  const { data } = await API.get(`/niche/${slug}/get`);
  return data;
};

const updateNiche = async ({ id, values }) => {
  const { data } = await API.put(`/niche/${id}`, values);
  return data;
};

/* ======================
   VALIDATION
====================== */

const validationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required.")
    .trim("Name cannot start or end with spaces.")
    .matches(
      /^(?! )[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Name can contain only alphabets and single spaces."
    )
    .min(2, "Name must contain at least 2 characters"),
});

/* ======================
   COMPONENT
====================== */

export default function EditNiche() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  /* ======================
     FETCH NICHE
  ====================== */

  const { data: niche, isLoading, isError } = useQuery({
    queryKey: ["niche", slug],
    queryFn: () => fetchNiche(slug),
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    onError: () => toast.error("Failed to fetch niche"),
  });

  /* ======================
     UPDATE MUTATION
  ====================== */

  const updateMutation = useMutation({
    mutationFn: updateNiche,

    onSuccess: (data) => {
      toast.success(data?.message || "Niche updated successfully");

      queryClient.invalidateQueries({ queryKey: ["niche"] });
      queryClient.invalidateQueries({ queryKey: ["niche", slug] });

      navigate("/dashboard/niche/all");
    },

    onError: (error) => {
      const message =
        error?.response?.data?.error || "Something went wrong!";
      toast.error(message);
    },
  });

  /* ======================
     FORM
  ====================== */

  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      name: niche?.name ?? "",
      description: niche?.description ?? "",
      status: niche?.status ?? "",
    },

    validationSchema,

    onSubmit: (values) => {
      updateMutation.mutate({
        id: niche?._id,
        values,
      });
    },
  });

  if (isLoading) return <EditNicheSkeleton />;

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

      {/* Form */}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Edit Niche
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <FormInput
              label="Name"
              name="name"
              placeholder="Enter niche"
              formik={formik}
              transform={capitalizeWords}
              trimOnBlur
            />

            {/* Status */}
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

          {/* Description */}
          <FormTextarea
            label="Description"
            name="description"
            rows={6}
            placeholder="Description!"
            formik={formik}
          />

          {/* Submit */}

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending
                ? "Updating..."
                : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}