import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../services/API";
import { useAuth } from "../../context/AuthContext";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import EditQuestionSkeleton from "./Skeleton/EditQuestionSkeleton";
import { ArrowBigLeft } from "lucide-react";
import Button from "../../components/ui/Button/Button";
import FormInput from "../../components/ui/Form/FormInput";
import FormSelect from "../../components/ui/Form/FormSelect";

const humanizeOptionValue = (value = "") =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const validationSchema = Yup.object({
  title: Yup.string().trim().required("Title required"),
  questionText: Yup.string().trim().required("Question required"),
  status: Yup.string()
    .oneOf(["active", "inactive", "pending"])
    .required("Status required"),
  options: Yup.array()
    .of(
      Yup.object({
        value: Yup.string().trim().required("Option required"),
        point: Yup.number().required("Score required"),
      })
    )
    .min(2, "At least 2 options required"),
});

const SCORE_OPTIONS = [
  { label: "Positive", value: 1 },
  { label: "Neutral", value: 0 },
  { label: "Negative", value: -1 },
];

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const nicheId = authUser?.nicheId;
  const [isLoading, setIsLoading] = useState(true);

  const [initialValues, setInitialValues] = useState(null);

  /* ---------------- Fetch Question ---------------- */
  useEffect(() => {
    if (!nicheId || !id) return;

    (async () => {
      try {
        setIsLoading(true);
        const res = await API.get(
          `/questions/niche/${nicheId}`
        );

        const question = res.data?.data?.find((q) => q._id === id);

        if (!question) {
          toast.error("Question not found");
          navigate("/dashboard/questions/all");
          return;
        }

        setInitialValues({
          title: question.title || "",
          questionText: question.questionText || "",
          order: question.order || 1, // hidden but preserved
          status: question.status || "pending",
          options:
            question.options?.map((o) => ({
              value: o.value,
              point: o.point ?? 0,
              action: o.action || "CONTINUE",
            })) || [
              { value: "", point: 0, action: "CONTINUE" },
              { value: "", point: 0, action: "CONTINUE" },
            ],
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load question");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, nicheId, navigate]);

  // if (!initialValues) return null;
  if (isLoading) {
    return (<EditQuestionSkeleton />);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Questions" },
        ]}
        actions={[
          {
            label: "Back",
            to: `/dashboard/questions/all`,
            Icon: ArrowBigLeft,
            variant: "success",
          },
        ]}
      />

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Edit Question</h2>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values) => {
            try {
              const payload = {
                title: values.title.trim(),
                questionText: values.questionText.trim(),
                order: values.order, // hidden but sent
                status: values.status,
                slug: values.title
                  .toLowerCase()
                  .trim()
                  .replace(/\s+/g, "-"),
                options: values.options.map((opt) => ({
                  label: humanizeOptionValue(opt.value),
                  value: opt.value,
                  point: opt.point,
                  action: opt.action || "CONTINUE",
                })),
              };

              await API.put(`/questions/${id}`, payload);

              toast.success("Question updated successfully");
              navigate("/dashboard/questions/all");
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message || "Update failed"
              );
            }
          }}
        >
          {(formik) => (
            <Form className="space-y-6">
              {/* Title & Question */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium">
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

                <div>
                  <label className="text-sm font-medium">
                    Question <span className="text-red-500">*</span>
                  </label>
                  <FormInput
                    name="questionText"
                    type="text"
                    placeholder="Enter question text"
                    formik={formik}
                    trimOnBlur
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium">
                  Status <span className="text-red-500">*</span>
                </label>
                <FormSelect
                  name="status"
                  formik={formik}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "pending", label: "Pending" }
                  ]}
                />
              </div>

              {/* Options */}
              <FieldArray name="options">
                {({ push, remove }) => (
                  <div className="border rounded p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Answer Options</h3>
                      <button
                        type="button"
                        onClick={() =>
                          push({ value: "", point: 0, action: "CONTINUE" })
                        }
                        className="text-blue-600 text-sm"
                      >
                        + Add Option
                      </button>
                    </div>

                    {formik.values.options.map((opt, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                      >
                        <input
                          value={humanizeOptionValue(opt.value)}
                          onChange={(e) => {
                            const raw = e.target.value
                              .toLowerCase()
                              .trim()
                              .replace(/\s+/g, "_");
                            formik.setFieldValue(
                              `options.${index}.value`,
                              raw
                            );
                          }}
                          placeholder={`Option ${index + 1}`}
                          className="md:col-span-6 border rounded px-3 py-2"
                        />

                        <select
                          value={opt.point}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `options.${index}.point`,
                              Number(e.target.value)
                            )
                          }
                          className="md:col-span-3 border rounded px-3 py-2"
                        >
                          {SCORE_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={opt.action}
                          onChange={(e) =>
                            formik.setFieldValue(
                              `options.${index}.action`,
                              e.target.value
                            )
                          }
                          className="md:col-span-2 border rounded px-3 py-2"
                        >
                          <option value="CONTINUE">Continue</option>
                          <option value="STOP_CONVERSATION">
                            Stop Conversation
                          </option>
                          <option value="END">End</option>
                        </select>

                        {formik.values.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="md:col-span-1 text-red-500 text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </FieldArray>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={formik.isSubmitting}
                >
                  Update Question
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
