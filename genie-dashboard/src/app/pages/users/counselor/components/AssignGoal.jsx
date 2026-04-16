import React, { useState } from "react";
import { API } from "../../../../services/API";
import toast from "react-hot-toast";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
    goalPeriod: Yup.string()
        .oneOf(["monthly"])
        .required("Goal period is required"),

    startDate: Yup.date().required("Start date is required"),
    endDate: Yup.date().required("End date is required"),

    applicationsTarget: Yup.number()
        .typeError("Must be number")
        .positive("Must be > 0")
        .nullable(),

    admissionsTarget: Yup.number()
        .typeError("Must be number")
        .positive("Must be > 0")
        .nullable()
}).test(
    "at-least-one",
    "At least one goal is required",
    (values) => values.applicationsTarget || values.admissionsTarget
);

export default function AssignGoal({ counselorData }) {
    const [loading, setLoading] = useState(false);
    const counselorId = counselorData?._id;

    const initialValues = {
        goalPeriod: "monthly",
        startDate: "",
        endDate: "",
        applicationsTarget: "",
        admissionsTarget: ""
    };

    const calculateEndDate = (start) => {
        if (!start) return "";

        const [y, m, d] = start.split("-").map(Number);
        const startDate = new Date(y, m - 1, d);

        const end = new Date(startDate);
        end.setDate(end.getDate() + 29); // 30 days total

        const yyyy = end.getFullYear();
        const mm = String(end.getMonth() + 1).padStart(2, "0");
        const dd = String(end.getDate()).padStart(2, "0");

        return `${yyyy}-${mm}-${dd}`;
    };

    const handleSubmit = async (values, { resetForm }) => {
        if (!counselorId) {
            toast.error("Invalid counselor");
            return;
        }

        try {
            setLoading(true);
            const endDate = calculateEndDate(values.startDate);

            const goals = [];

            if (values.applicationsTarget) {
                goals.push({
                    goalType: "applications_done",
                    targetValue: Number(values.applicationsTarget)
                });
            }

            if (values.admissionsTarget) {
                goals.push({
                    goalType: "admissions_done",
                    targetValue: Number(values.admissionsTarget)
                });
            }

            const payload = {
                counselorId,
                goalPeriod: values.goalPeriod,
                startDate: values.startDate,
                endDate,
                goals // ✅ NEW ARRAY
            };

            const { data } = await API.post("/assign-goal", payload);

            toast.success(data?.message || "Goals assigned successfully");
            resetForm();

        } catch (error) {
            console.error(error);
            toast.error(
                error?.response?.data?.message || "Failed to assign goal"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 sm:p-6">

            {/* HEADER */}
            <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Assign Counselor Goal
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Set performance targets for the counselor
                </p>
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ values, setFieldValue }) => {

                    return (
                        <Form className="space-y-6">

                            {/* GOALS */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-700">
                                    Goals
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Applications */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">
                                            Applications
                                        </label>
                                        <Field
                                            type="number"
                                            name="applicationsTarget"
                                            placeholder="e.g. 50"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                        />
                                        <ErrorMessage name="applicationsTarget" component="p" className="text-xs text-red-500 mt-1" />
                                    </div>

                                    {/* Admissions */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">
                                            Admissions
                                        </label>
                                        <Field
                                            type="number"
                                            name="admissionsTarget"
                                            placeholder="e.g. 20"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                        />
                                        <ErrorMessage name="admissionsTarget" component="p" className="text-xs text-red-500 mt-1" />
                                    </div>

                                </div>
                            </div>

                            {/* PERIOD */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-gray-700">
                                    Goal Period
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                    {/* Period */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Period</label>
                                        <Field
                                            as="select"
                                            name="goalPeriod"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFieldValue("goalPeriod", value);

                                                if (values.startDate) {
                                                    setFieldValue("endDate", calculateEndDate(values.startDate));
                                                }
                                            }}
                                        >
                                            <option value="">Select Period</option>
                                            <option value="monthly">Monthly</option>
                                        </Field>
                                        <ErrorMessage name="goalPeriod" component="p" className="text-xs text-red-500 mt-1" />
                                    </div>

                                    {/* Start Date */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">Start Date</label>
                                        <Field
                                            type="date"
                                            name="startDate"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFieldValue("startDate", value);

                                                if (values.goalPeriod === "monthly") {
                                                    setFieldValue("endDate", calculateEndDate(value));
                                                }
                                            }}
                                        />
                                        <ErrorMessage name="startDate" component="p" className="text-xs text-red-500 mt-1" />
                                    </div>

                                    {/* End Date */}
                                    <div className="flex flex-col">
                                        <label className="text-xs text-gray-500 mb-1">End Date</label>
                                        <Field
                                            type="date"
                                            name="endDate"
                                            disabled
                                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-100 cursor-not-allowed"
                                        />
                                        <ErrorMessage name="endDate" component="p" className="text-xs text-red-500 mt-1" />
                                    </div>

                                </div>
                            </div>

                            {/* ACTION */}
                            <div className="flex justify-end pt-4 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Assigning..." : "Assign Goal"}
                                </button>
                            </div>

                        </Form>
                    );
                }}
            </Formik>
        </div>
    );
}