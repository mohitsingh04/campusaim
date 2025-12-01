import React, { useEffect, useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";
import { API } from "../../../../contexts/API";
import { useOutletContext } from "react-router-dom";
import { DashboardOutletContextProps } from "../../../../types/types";
import { getStatusAccodingToField } from "../../../../contexts/Callbacks";
import { currencyOptions } from "../../../../common/ExtraData";

interface HiringType {
  uniqueId?: string;
  title?: string;
  job_description?: string;
  experience?: string;
  job_type?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  salary?: Record<string, string>;
  skills?: string[];
  qualification?: string[];
}

interface Props {
  hiring?: HiringType;
  getHiring: () => Promise<void> | void;
  setIsEditing: React.Dispatch<React.SetStateAction<string>>;
}

export default function EditHiring({ hiring, getHiring, setIsEditing }: Props) {
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [qualification, setQualification] = useState<string[]>([]);
  const [qualificationInput, setQualificationInput] = useState("");
  const [salary, setSalary] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const { status } = useOutletContext<DashboardOutletContextProps>();

  useEffect(() => {
    if (hiring) {
      setSalary(hiring?.salary || {});
      setSkills(hiring?.skills || []);
      setQualification(hiring?.qualification || []);
    }
  }, [hiring]);

  const handleSkills = () => {
    const trimmed = skillsInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Entry",
        text: `"${trimmed}" is already in the list.`,
      });
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillsInput("");
  };

  const handleSkillsRemove = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQualification = () => {
    const trimmed = qualificationInput.trim();
    if (!trimmed) return;
    if (qualification.includes(trimmed)) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Entry",
        text: `"${trimmed}" is already in the list.`,
      });
      return;
    }
    setQualification((prev) => [...prev, trimmed]);
    setQualificationInput("");
  };

  const handleQualificationRemove = (index: number) => {
    setQualification((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPrice = () => {
    if (!currency || !amountInput) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please select a currency and enter a price.",
      });
      return;
    }
    setSalary((prev) => ({ ...prev, [currency]: amountInput }));
    setCurrency("");
    setAmountInput("");
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    // format to yyyy-mm-dd for input[type=date]
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  };

  const formik = useFormik({
    initialValues: {
      title: hiring?.title || "",
      job_description: hiring?.job_description || "",
      experience: hiring?.experience || "",
      job_type: hiring?.job_type || "",
      start_date: formatDate(hiring?.start_date),
      end_date: formatDate(hiring?.end_date),
      status: hiring?.status || "",
    },
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      // basic validations
      if (!salary || Object.values(salary).every((v) => !v)) {
        Swal.fire({ icon: "warning", title: "Salary field is required" });
        return;
      }
      if (skills.length === 0) {
        Swal.fire({ icon: "warning", title: "Skill is Required" });
        return;
      }
      if (qualification.length === 0) {
        Swal.fire({ icon: "warning", title: "Qualification is Required" });
        return;
      }

      const payload = { ...values, salary, skills, qualification };

      try {
        const response = await API.patch(
          `/hiring/${hiring?.uniqueId}`,
          payload
        );
        if (response) {
          Swal.fire({
            icon: "success",
            title: "Successful",
            text: response?.data?.message || "Successfully Updated Hiring",
          });
          resetForm();
          setSalary({});
          setSkills([]);
          setQualification([]);
          await getHiring();
          setIsEditing("");
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.error || "Something Went Wrong",
        });
      }
    },
  });

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Edit Hiring
          </h2>
        </div>

        {/* IMPORTANT: form element with onSubmit so the submit button works */}
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Title
            </label>
            <input
              type="text"
              placeholder="Enter Title"
              {...formik.getFieldProps("title")}
              className={`w-full p-2 border rounded ${
                formik.touched.title && formik.errors.title
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
            />
            {formik.touched.title && formik.errors.title && (
              <small className="text-red-500">{formik.errors.title}</small>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description
            </label>
            <JoditEditor
              value={formik.values.job_description}
              onChange={(val: string) =>
                formik.setFieldValue("job_description", val)
              }
              config={editorConfig}
              className="w-full rounded"
            />
            {formik.touched.job_description &&
              formik.errors.job_description && (
                <small className="text-red-500">
                  {formik.errors.job_description}
                </small>
              )}
          </div>

          {/* Skills & Qualification */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills Required
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Skills Required"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="flex-1 p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={handleSkills}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      {skill}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSkillsRemove(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Qualification Required
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Qualification Required"
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  className="flex-1 p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={handleQualification}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {qualification.map((q, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span className="text-gray-900 dark:text-gray-100">
                      {q}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQualificationRemove(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Experience & Job Type */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Experience Required
              </label>
              <select
                {...formik.getFieldProps("experience")}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">--Select Experience--</option>
                <option value="Fresher">Fresher</option>
                <option value="0-6Month">0-6 Month</option>
                <option value="1Year-3Year">1-3 Year</option>
                <option value="3Year-5Year">3-5 Year</option>
                <option value="5Year+">5+ Year</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Job Type
              </label>
              <select
                {...formik.getFieldProps("job_type")}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">--Select Job Type--</option>
                <option value="Internship">Internship</option>
                <option value="Job">Job</option>
              </select>
            </div>
          </div>

          {/* Start & End Date */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                {...formik.getFieldProps("start_date")}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                {...formik.getFieldProps("end_date")}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Salary & Status */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Salary/Stipend
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select Currency</option>
                  {currencyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Enter Amount"
                  className="flex-1 p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={handleAddPrice}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add Price
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(salary).map(([cur, val]) => (
                  <div
                    key={cur}
                    className="flex items-center bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span className="text-[var(--yp-text-primary)]">
                      {cur}:{val}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSalary((prev) => {
                          const updated = { ...prev };
                          delete updated[cur];
                          return updated;
                        })
                      }
                      className="text-gray-500 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                {...formik.getFieldProps("status")}
                className="w-full p-2 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">--Select Status--</option>
                {getStatusAccodingToField(status, "hiring").map((s, i) => (
                  <option key={i} value={s.parent_status}>
                    {s.parent_status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 ms-2"
              onClick={() => setIsEditing("")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
