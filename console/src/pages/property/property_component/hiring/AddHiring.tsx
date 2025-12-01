import { useMemo, useState } from "react";
import JoditEditor from "jodit-react";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import toast from "react-hot-toast";
import { PropertyProps } from "../../../../types/types";
import { currencyOptions } from "../../../../common/ExtraData";

type SalaryType = Record<string, string>;

interface HiringFormValues {
  property_id: number | string;
  title: string;
  job_description: string;
  experience: string;
  job_type: string;
  start_date: string;
  end_date: string;
}

interface AddHiringProps {
  property: PropertyProps | null;
  getHiring: () => void;
}

export default function AddHiring({ property, getHiring }: AddHiringProps) {
  const editorConfig = useMemo(() => getEditorConfig(), []);

  const [skills, setSkills] = useState<string[]>([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [qualification, setQualification] = useState<string[]>([]);
  const [qualificationInput, setQualificationInput] = useState("");
  const [salary, setSalary] = useState<SalaryType>({});
  const [currency, setCurrency] = useState("");
  const [amountInput, setAmountInput] = useState("");

  // Add skill
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

  // Add qualification
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

  // Add salary
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

  const formik = useFormik<HiringFormValues>({
    initialValues: {
      property_id: property?.uniqueId || "",
      title: "",
      job_description: "",
      experience: "",
      job_type: "",
      start_date: "",
      end_date: "",
    },
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (Object.keys(salary).length === 0) {
        Swal.fire({ icon: "warning", title: "Salary field is required" });
        return;
      }
      if (skills.length === 0) {
        Swal.fire({ icon: "warning", title: "Skill is required" });
        return;
      }
      if (qualification.length === 0) {
        Swal.fire({ icon: "warning", title: "Qualification is required" });
        return;
      }

      const payload = { ...values, salary, skills, qualification };
      try {
        const response = await API.post("/hiring", payload);
        if (response) {
          toast(response?.data?.message || "Successfully Added Hiring");
          formik.resetForm();
          setSalary({});
          setSkills([]);
          setQualification([]);
          getHiring();
        }
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  return (
    <div className="border-t border-[var(--yp-border-primary)] pt-4">
      <div className="rounded-lg shadow-sm">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Job Title
            </label>
            <input
              placeholder="Enter Title"
              {...formik.getFieldProps("title")}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Job Description
            </label>
            <JoditEditor
              value={formik.values.job_description}
              onChange={(value) =>
                formik.setFieldValue("job_description", value)
              }
              config={editorConfig}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Skills Required
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="Enter Skills Required"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                <button
                  type="button"
                  onClick={handleSkills}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-bg)] bg-[var(--yp-green-text)] text-nowrap"
                >
                  Add
                </button>
              </div>
              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-[var(--yp-tertiary)] px-3 py-1 rounded-full text-sm"
                    >
                      <span className="text-[var(--yp-text-primary)]">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSkillsRemove(idx)}
                        className="ml-2 text-[var(--yp-red-bg)]"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Qualification Required
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  placeholder="Enter Qualification Required"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                <button
                  type="button"
                  onClick={handleQualification}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-bg)] bg-[var(--yp-green-text)] text-nowrap"
                >
                  Add
                </button>
              </div>
              {qualification.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {qualification.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center bg-[var(--yp-tertiary)] px-3 py-1 rounded-full text-sm"
                    >
                      <span className="text-[var(--yp-text-primary)]">
                        {item}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQualificationRemove(idx)}
                        className="ml-2 text-[var(--yp-red-bg)]"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Experience
              </label>
              <select
                {...formik.getFieldProps("experience")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
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
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Job Type
              </label>
              <select
                {...formik.getFieldProps("job_type")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">--Select Job Type--</option>
                <option value="Internship">Internship</option>
                <option value="Job">Job</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Start Date
              </label>
              <input
                type="date"
                {...formik.getFieldProps("start_date")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                End Date
              </label>
              <input
                type="date"
                {...formik.getFieldProps("end_date")}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Salary / Stipend
            </label>
            <div className="flex gap-2">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
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
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              <button
                type="button"
                onClick={handleAddPrice}
                className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-bg)] bg-[var(--yp-green-text)] text-nowrap"
              >
                Add Price
              </button>
            </div>
            {Object.keys(salary).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(salary).map(([cur, val]) => (
                  <div
                    key={cur}
                    className="flex items-center bg-[var(--yp-tertiary)] px-3 py-1 rounded-full text-sm"
                  >
                    <span className="text-[var(--yp-text-primary)]">
                      {cur}:{val}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSalary((prev) => {
                          const s = { ...prev };
                          delete s[cur];
                          return s;
                        })
                      }
                      className="ml-2 text-[var(--yp-red-bg)]"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
