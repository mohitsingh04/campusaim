import React, { useMemo } from "react";
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../../services/API";
import Select from "react-select";
import { ArrowLeft } from "lucide-react";
import EditQuestionSetSkeleton from "./Skeleton/EditQuestionSetSkeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FormInput from "../../../components/ui/Form/FormInput";
import FormTextarea from "../../../components/ui/Form/FormTextarea";
import FormSelect from "../../../components/ui/Form/FormSelect";

const slugify = (str = "") =>
  str
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/_+/g, "_");

const validationSchema = Yup.object({
  nicheId: Yup.string().required("Niche is required."),
  order: Yup.number()
    .typeError("Order must be a number")
    .integer("Order must be an integer")
    .min(1, "Order must be at least 1")
    .required("Order is required"),
  title: Yup.string()
    .required("Title is required.")
    .trim("Title cannot start or end with spaces.")
    .matches(
      /^(?! )[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/,
      "Only alphanumeric words with single spaces allowed."
    )
    .min(2, "Title must contain at least 2 characters."),
  questionText: Yup.string()
    .required("Question text is required.")
    .max(500, "Max 500 characters allowed."),
  options: Yup.array()
    .of(
      Yup.object({
        value: Yup.string().required("Value required"),
        label: Yup.string().required("Label required"),
        point: Yup.number()
          .oneOf([-1, 0, 1], "Invalid score type")
          .required("Point required"),
        action: Yup.string().required("Action required"),
      })
    )
    .min(2, "At least 2 options are required"),
  isActive: Yup.string().required("Status is required."),
});

/* =========================
   API FUNCTIONS
========================= */

const fetchQuestionSet = async (slug) => {
  const { data } = await API.get(`/question-set/${slug}`);
  return data;
};

const fetchNiche = async () => {
  const { data } = await API.get("/niche/options");
  return data.data;
};

const updateQuestionSet = async ({ slug, payload }) => {
  return API.put(`/question-set/${slug}`, payload);
};

export default function EditQuestionSet() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const queryClient = useQueryClient();

  /* =========================
     FETCH QUESTION
  ========================== */

  const { data: questionSet, isLoading: questionLoading } = useQuery({
    queryKey: ["question-set", slug],
    queryFn: () => fetchQuestionSet(slug),
    enabled: !!slug,
  });

  /* =========================
     FETCH NICHE
  ========================== */

  const { data: niche = [] } = useQuery({
    queryKey: ["niche"],
    queryFn: fetchNiche,
  });

  const isLoading = questionLoading;

  /* =========================
     UPDATE MUTATION
  ========================== */

  const updateMutation = useMutation({
    mutationFn: updateQuestionSet,

    onSuccess: (res) => {
      toast.success(res?.data?.message || "Question updated successfully");

      queryClient.invalidateQueries(["question-set"]);
      queryClient.invalidateQueries(["question-set", slug]);

      navigate("/dashboard/question-set/all");
    },

    onError: (err) => {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to update question";

      toast.error(message);
    },
  });

  const initialValues = useMemo(
    () => ({
      nicheId: questionSet?.nicheId?._id || "",
      order: questionSet?.order || 1,
      title: questionSet?.title || "",
      questionText: questionSet?.questionText || "",
      isActive: questionSet?.isActive || "pending",
      options:
        questionSet?.options?.length >= 2
          ? questionSet.options
          : [
            { value: "", label: "", point: 0, action: "CONTINUE" },
            { value: "", label: "", point: 0, action: "CONTINUE" },
          ],
    }),
    [questionSet]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema,

    onSubmit: async (values) => {
      const payload = {
        nicheId: values.nicheId,
        order: Number(values.order),
        title: values.title.trim(),
        questionText: values.questionText.trim(),
        isActive: values.isActive,
        options: values.options.map((opt) => ({
          value: opt.value.trim().toLowerCase(),
          label: opt.label.trim(),
          point: Number(opt.point),
          action: opt.action,
        })),
      };

      updateMutation.mutate({ slug, payload });
    },
  });

  const nicheOptions = niche.map((item) => ({
    value: item._id,
    label: item.name,
  }));

  if (isLoading) return <EditQuestionSetSkeleton />;

  return (
    /* UI BELOW IS EXACTLY SAME AS YOUR ORIGINAL */
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Question Set", to: "/dashboard/question-set/all" },
          { label: "Edit", to: "/dashboard/question-set/all" },
          { label: `${questionSet?.title}`, active: true },
        ]}
        actions={[
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
            Edit Question
          </h2>
        </div>

        <FormikProvider value={formik}>
          <form onSubmit={formik.handleSubmit} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Niche */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Niche <span className="text-red-500">*</span>
                </label>
                <Select
                  name="nicheId"
                  options={nicheOptions}
                  value={
                    nicheOptions.find(
                      (o) => o.value === formik.values.nicheId
                    ) || null
                  }
                  onChange={(option) =>
                    formik.setFieldValue(
                      "nicheId",
                      option ? option.value : ""
                    )
                  }
                  onBlur={() => formik.setFieldTouched("nicheId", true)}
                  placeholder="Select niche"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Order <span className="text-red-500">*</span>
                </label>
                <FormInput
                  name="order"
                  type="number"
                  formik={formik}
                  trimOnBlur
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="isActive"
                  formik={formik}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "pending", label: "Pending" }
                  ]}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <FormInput
                name="title"
                type="text"
                placeholder="Enter title"
                formik={formik}
                trimOnBlur
              />
            </div>

            {/* Questions Text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Question Text <span className="text-red-500">*</span>
              </label>
              <FormTextarea
                name="questionText"
                rows={4}
                placeholder="Question Text"
                formik={formik}
              />
            </div>

            <FieldArray name="options">
              {({ push, remove }) => (
                <div className="space-y-4">
                  {formik.values.options.map((opt, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 items-end"
                    >
                      {/* Label */}
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="label"
                          value={opt.label}
                          onChange={(e) => {
                            const newLabel = e.target.value;
                            formik.setFieldValue(`options[${index}].label`, newLabel);
                            formik.setFieldValue(
                              `options[${index}].value`,
                              newLabel ? slugify(newLabel) : ""
                            );
                          }}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>

                      {/* Value */}
                      {/* <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="value"
                          value={opt.value}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `options[${index}].value`,
                              e.target.value
                            )
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div> */}

                      <div className="sm:col-span-2">
                        <select
                          value={opt.point}
                          onChange={(e) =>
                            formik.setFieldValue(`options[${index}].point`, Number(e.target.value))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value={1}>Positive</option>
                          <option value={0}>Neutral</option>
                          <option value={-1}>Negative</option>
                        </select>
                      </div>

                      <div className="col-span-3">
                        <select
                          value={opt.action}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `options[${index}].action`,
                              e.target.value
                            )
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="CONTINUE">CONTINUE</option>
                          <option value="STOP_CONVERSATION">
                            STOP_CONVERSATION
                          </option>
                          <option value="JUMP">JUMP</option>
                          <option value="END">END</option>
                        </select>
                      </div>

                      <div className="col-span-1">
                        {formik.values.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="px-2 py-2 text-sm bg-red-100 text-red-600 rounded-md"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      push({
                        value: "",
                        label: "",
                        point: 0,
                        action: "CONTINUE",
                      })
                    }
                    className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    + Add Option
                  </button>
                </div>
              )}
            </FieldArray>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate("/dashboard/question-set/all")}
                className="px-4 py-2 text-sm border rounded-md"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
              >
                {formik.isSubmitting ? "Updating..." : "Update"}
              </button>
            </div>
          </form>
        </FormikProvider>
      </div>
    </div>
  );
}