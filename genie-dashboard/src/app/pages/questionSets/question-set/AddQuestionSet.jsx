import React, { useCallback, useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../../../components/ui/BreadCrumb/Breadcrumbs";
import { Link, useNavigate } from "react-router-dom";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { API } from "../../../services/API";
import Select from "react-select";
import { ArrowLeft } from "lucide-react";
import FormInput from "../../../components/ui/Form/FormInput";
import FormTextarea from "../../../components/ui/Form/FormTextarea";

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
                label: Yup.string().trim().required("Label required"),
                value: Yup.string().trim().required(),
                point: Yup.number().oneOf([-1, 0, 1]).required(),
                action: Yup.string().required(),
            })
        )
        .min(2, "At least 2 options are required"),
});

export default function AddQuestionSet() {
    const navigate = useNavigate();
    const [niche, setNiche] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNiche = useCallback(async () => {
        setIsLoading(true);

        try {
            const res = await API.get("/niche", {
                params: {
                    status: "active",
                    page: 1,
                    limit: 100,
                },
            });

            setNiche(res?.data?.data || []);

        } catch (err) {
            console.error("fetchNiche error:", err);
            toast.error("Failed to fetch niche");
            setNiche([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNiche();
    }, [fetchNiche]);

    const initialValues = useMemo(
        () => ({
            nicheId: "",
            order: 1,
            title: "",
            questionText: "",
            options: [
                { value: "", label: "", point: 0, action: "CONTINUE" },
                { value: "", label: "", point: 0, action: "CONTINUE" },
            ],
        }),
        []
    );

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const payload = {
                    nicheId: values.nicheId,
                    order: Number(values.order),
                    title: values.title.trim(),
                    questionText: values.questionText.trim(),
                    options: values.options.map((opt) => ({
                        value: opt.value.trim().toLowerCase(),
                        label: opt.label.trim(),
                        point: Number(opt.point),
                        action: opt.action,
                    })),
                };

                const res = await API.post("/question-set", payload);

                toast.success(res?.data?.message || "Question created successfully");
                resetForm();
                navigate("/dashboard/question-set/all");
            } catch (err) {
                console.error(err);
                const message =
                    err?.response?.data?.error ||
                    err?.response?.data?.message ||
                    "Failed to create question";
                toast.error(message);
            } finally {
                setSubmitting(false);
            }
        },
    });

    const nicheOptions = niche.map((item) => ({
        value: item._id,
        label: item.name,
    }));

    // if (isLoading) return <h1>Loading...</h1>;

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Question Sets", to: "/dashboard/question-set/all" },
                    { label: "Add", active: true },
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
                    <h2 className="text-xl font-semibold text-gray-900">Add Question</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Create a question flow step for selected niche
                    </p>
                </div>

                <FormikProvider value={formik}>
                    <form onSubmit={formik.handleSubmit} className="px-6 py-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Niche */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Niche <span className="text-red-500">*</span>
                                </label>
                                {isLoading
                                    ? "Loading Niche..."
                                    : (<>
                                        <Select
                                            name="nicheId"
                                            options={nicheOptions}
                                            value={
                                                nicheOptions.find(
                                                    (o) => o.value === formik.values.nicheId
                                                ) || null
                                            }
                                            onChange={(option) =>
                                                formik.setFieldValue("nicheId", option ? option.value : "")
                                            }
                                            onBlur={() => formik.setFieldTouched("nicheId", true)}
                                            placeholder="Select niche"
                                        />
                                        {formik.touched.nicheId && formik.errors.nicheId && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {formik.errors.nicheId}
                                            </p>
                                        )}
                                    </>)
                                }
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

                        {/* Question Text */}
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
                                                        formik.setFieldValue(`options[${index}].value`, slugify(newLabel));
                                                    }}
                                                    className="w-full border rounded-lg px-3 py-2"
                                                />
                                            </div>

                                            {/* Value */}
                                            {/* <div className="sm:col-span-3">
                                                <input
                                                    type="text"
                                                    placeholder="Value"
                                                    value={opt.value}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        const prevValue = opt.value;
                                                        const autoLabelFromPrevValue = humanize(prevValue);

                                                        formik.setFieldValue(`options[${index}].value`, newValue);

                                                        if (!opt.label || opt.label === autoLabelFromPrevValue) {
                                                            formik.setFieldValue(
                                                                `options[${index}].label`,
                                                                humanize(newValue)
                                                            );
                                                        }
                                                    }}
                                                    className="w-full border rounded-lg px-3 py-2"
                                                />
                                            </div> */}

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

                                            {/* Action (reduce width on desktop) */}
                                            <div className="sm:col-span-3 lg:col-span-2">
                                                <select
                                                    value={opt.action}
                                                    onChange={(e) =>
                                                        formik.setFieldValue(`options[${index}].action`, e.target.value)
                                                    }
                                                    className="w-full border rounded-lg px-3 py-2"
                                                >
                                                    <option value="CONTINUE">CONTINUE</option>
                                                    <option value="STOP_CONVERSATION">STOP_CONVERSATION</option>
                                                    <option value="CAPTURE_TEXT">CAPTURE_TEXT</option>
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
                                {formik.isSubmitting ? "Saving..." : "Create Question"}
                            </button>
                        </div>
                    </form>
                </FormikProvider>
            </div>
        </div>
    );
}
