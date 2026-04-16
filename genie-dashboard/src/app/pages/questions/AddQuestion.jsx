import React, { useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { FormikProvider, useFormik, FieldArray } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../services/API";
import { useAuth } from "../../context/AuthContext";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TemplateQuestionsModal from "../../components/modal/TemplateQuestionsModal";
import FormInput from "../../components/ui/Form/FormInput";
import FormTextarea from "../../components/ui/Form/FormTextarea";
import Loader from "../../common/Loader/Loader";

/* ---------------- UTILITIES ---------------- */
const slugify = (str = "") =>
    str
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "_")
        .replace(/-+/g, "_")
        .replace(/_+/g, "_");

/* ---------------- VALIDATION ---------------- */
const validationSchema = Yup.object({
    title: Yup.string()
        .trim()
        .required("Title required")
        .min(2, "Minimum 2 characters"),
    questionText: Yup.string()
        .trim()
        .required("Question required")
        .max(500, "Max 500 characters"),
    options: Yup.array()
        .of(
            Yup.object({
                label: Yup.string().trim().required("Label required"),
                value: Yup.string().trim().required("Value required"),
                point: Yup.number()
                    .oneOf([-1, 0, 1], "Invalid score")
                    .required("Score required"),
                action: Yup.string().required("Action required"),
            })
        )
        .min(2, "At least 2 options required"),
});

export default function AddQuestion() {
    const navigate = useNavigate();
    const { authUser, authLoading } = useAuth();
    const nicheId = authUser?.nicheId;
    const organizationId = authUser?.organizationId;
    const [QuestionSet, setQuestionSet] = useState([]);
    const [Questions, setQuestions] = useState([]);

    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [addedTemplateSlugs, setAddedTemplateSlugs] = useState(new Set());

    const fetchQuestionSet = async () => {
        try {
            const { data } = await API.get(`/question-set/list/${nicheId}`);
            const activeQues = data?.data.filter((q) => q.isActive === "active");
            setQuestionSet(activeQues);
        } catch (error) {
            console.error(error);
            toast.error("Internal server error.");
        }
    }

    const fetchQuestions = async () => {
        try {
            const { data } = await API.get(`/questions/organization/${organizationId}`);
            const activeQues = data?.data.filter((q) => q.status === "active");
            setQuestions(activeQues);
        } catch (error) {
            console.error(error);
            toast.error("Internal server error.");
        }
    }

    useEffect(() => {
        if (!nicheId) return;
        fetchQuestionSet();
    }, [nicheId]);

    useEffect(() => {
        if (!organizationId) return;
        fetchQuestions();
    }, [organizationId]);

    // Build slug set from DB questions
    const existingQuestionSlugs = useMemo(() => {
        const set = new Set();

        for (const q of Questions) {
            if (q.slug) set.add(q.slug);
        }

        return set;
    }, [Questions]);

    // Merge DB slugs + session slugs
    const mergedTemplateSlugs = useMemo(() => {
        return new Set([...existingQuestionSlugs, ...addedTemplateSlugs]);
    }, [existingQuestionSlugs, addedTemplateSlugs]);

    const initialValues = useMemo(
        () => ({
            title: "",
            order: "",
            questionText: "",
            options: [
                {
                    value: "",
                    label: "",
                    point: 0,
                    action: "CONTINUE",
                },
                {
                    value: "",
                    label: "",
                    point: 0,
                    action: "CONTINUE",
                },
            ],
        }),
        []
    );

    const formik = useFormik({
        initialValues,
        validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const payload = {
                    nicheId,
                    questions: [
                        {
                            title: values.title.trim(),
                            order: values.order,
                            questionText: values.questionText.trim(),
                            status: "active",
                            options: values.options.map((opt) => ({
                                label: opt.label.trim(),
                                value: slugify(opt.label), // ← FIX
                                point: Number(opt.point),
                                action: opt.action,
                            })),
                        },
                    ],
                };
                await API.post(`/questions`, payload);

                toast.success("Question added successfully");
                resetForm();
                navigate("/dashboard/questions/all");
            } catch (error) {
                console.error("AddQuestion:", error);
                toast.error(
                    error?.response?.data?.message || "Failed to add question"
                );
            } finally {
                setSubmitting(false);
            }
        },
    });

    const handleTemplateSelect = (template) => {
        formik.setValues({
            title: template.title || "",
            order: template.order || "",
            questionText: template.questionText || "",
            options:
                template.options?.map((opt) => ({
                    label: opt.label,
                    value: slugify(opt.label),
                    point: opt.point,
                    action: opt.action,
                })) || [],
        });

        setAddedTemplateSlugs(prev => {
            const next = new Set(prev);
            // Include fallback to _id to guarantee a unique identifier is saved
            next.add(template.slug || template._id);
            return next;
        });
    };

    return (
        <>
            <div className="space-y-6">
                <Breadcrumbs
                    items={[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Questions", to: "/dashboard/questions/all" },
                        { label: "Add", active: true },
                    ]}
                    actions={[
                        {
                            label: "Back",
                            to: "/dashboard/questions/all",
                            Icon: ArrowLeft,
                            variant: "primary",
                        },
                    ]}
                />

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between px-6 py-5 border-b gap-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Add Question
                        </h2>

                        <button
                            type="button"
                            onClick={() => setShowTemplateModal(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 whitespace-nowrap"
                        >
                            Add Questions from template
                        </button>
                    </div>

                    <FormikProvider value={formik}>
                        <form onSubmit={formik.handleSubmit} className="px-6 py-6 space-y-6">

                            {/* Title + Order */}
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
                                        Question Order Number <span className="text-red-500">*</span>
                                    </label>
                                    <FormInput
                                        name="order"
                                        type="number"
                                        formik={formik}
                                        trimOnBlur
                                    />
                                </div>
                            </div>

                            {/* Question Text */}
                            <div>
                                <label className="text-sm font-medium">
                                    Question Text <span className="text-red-500">*</span>
                                </label>
                                <FormTextarea
                                    name="questionText"
                                    rows={4}
                                    placeholder="Question Text"
                                    formik={formik}
                                />
                            </div>

                            {/* Options */}
                            <FieldArray name="options">
                                {({ push, remove }) => (
                                    <div className="space-y-4">
                                        {formik.values.options.map((opt, index) => (
                                            <div
                                                key={index}
                                                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end border rounded-lg p-3 sm:border-0 sm:p-0"
                                            >
                                                {/* Label */}
                                                <div className="sm:col-span-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Label"
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

                                                {/* Point */}
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

                                                {/* Action */}
                                                <div className="sm:col-span-3 lg:col-span-2">
                                                    <select
                                                        value={opt.action}
                                                        onChange={(e) =>
                                                            formik.setFieldValue(`options[${index}].action`, e.target.value)
                                                        }
                                                        className="w-full border rounded-lg px-3 py-2"
                                                    >
                                                        <option value="CONTINUE">CONTINUE</option>
                                                        <option value="STOP_CONVERSATION">STOP</option>
                                                        <option value="JUMP">JUMP</option>
                                                        <option value="END">END</option>
                                                    </select>
                                                </div>

                                                {/* Remove */}
                                                <div className="sm:col-span-1 flex justify-end">
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
                                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                                        >
                                            + Add Option
                                        </button>
                                    </div>
                                )}
                            </FieldArray>

                            {/* Submit */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => navigate("/dashboard/questions/all")}
                                    className="px-4 py-2 text-sm border rounded-md"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                                >
                                    {formik.isSubmitting ? "Saving..." : "Create Question"}
                                </button>
                            </div>
                        </form>
                    </FormikProvider>
                </div>
            </div>
            {showTemplateModal && (
                <TemplateQuestionsModal
                    questionSets={QuestionSet}
                    addedTemplateSlugs={mergedTemplateSlugs}
                    onClose={() => setShowTemplateModal(false)}
                    onSelectTemplate={handleTemplateSelect}
                />
            )}
        </>
    );
}