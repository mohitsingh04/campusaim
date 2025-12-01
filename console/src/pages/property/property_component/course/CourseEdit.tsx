import { useState } from "react";
import { X } from "lucide-react";
import { API } from "../../../../contexts/API";
import Select from "react-select";
import { useFormik } from "formik";
import {
  getCategoryAccodingToField,
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../../../contexts/Callbacks";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { PropertyCourseValidation } from "../../../../contexts/ValidationsSchemas";
import {
  CategoryProps,
  DashboardOutletContextProps,
  PropertyProps,
  ReqKoItem,
} from "../../../../types/types";
import {
  currencyOptions,
  reactSelectDesignClass,
} from "../../../../common/ExtraData";
import ToggleButton from "../../../../ui/button/ToggleButton";

export default function EditCourseForm({
  requirements,
  keyOutcomes,
  categories,
  property,
  getPropertyCourse,
  setIsEditing,
  isEditing,
  getCourseById,
}: {
  requirements: ReqKoItem[];
  keyOutcomes: ReqKoItem[];
  categories: CategoryProps[];
  property: PropertyProps | null;
  getPropertyCourse: () => void;
  setIsEditing: any;
  isEditing: any;
  getCourseById: any;
}) {
  const [bestForInput, setBestForInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("INR");
  const { authUser, status } = useOutletContext<DashboardOutletContextProps>();
  const masterCourse = getCourseById(isEditing?.course_id);

  const formik = useFormik({
    initialValues: {
      course_id: isEditing?.course_id || "",
      course_name: isEditing?.course_name || masterCourse?.course_name || "",
      course_short_name:
        isEditing?.course_short_name || masterCourse?.course_short_name || "",
      course_level: isEditing?.course_level || masterCourse?.course_level || "",
      course_format:
        isEditing?.course_format || masterCourse?.course_format || "",
      course_type: isEditing?.course_type_id || masterCourse?.course_type || "",
      duration_value:
        isEditing?.duration?.split(" ")?.[0] ||
        masterCourse?.duration?.split(" ")?.[0] ||
        "",
      duration_type:
        isEditing?.duration?.split(" ")?.[1] ||
        masterCourse?.duration?.split(" ")?.[1] ||
        "",
      cerification_info:
        isEditing?.cerification_info ??
        masterCourse?.cerification_info ??
        false,
      certification_type:
        isEditing?.certification_type || masterCourse?.certification_type || "",
      requirements:
        isEditing?.requirements ||
        masterCourse?.requirements ||
        ([] as string[]),
      key_outcomes:
        isEditing?.key_outcomes ||
        masterCourse?.key_outcomes ||
        ([] as string[]),
      best_for:
        isEditing?.best_for || masterCourse?.best_for || ([] as string[]),
      languages:
        isEditing?.languages || masterCourse?.languages || ([] as string[]),
      prices: Object.fromEntries(
        Object.entries(isEditing?.prices || {}).map(([key, val]) => [
          key,
          Number(val || 0),
        ])
      ),
      status: isEditing?.status || "",
    },
    enableReinitialize: true,
    validationSchema: PropertyCourseValidation,
    onSubmit: async (values) => {
      try {
        const payload = {
          ...values,
          property_id: property?.uniqueId || "",
          userId: authUser?.uniqueId || "",
          final_requirement: values?.requirements,
          final_key_outcomes: values?.key_outcomes,
          duration: `${values?.duration_value} ${values?.duration_type}`,
          prices: Object.fromEntries(
            Object.entries(values.prices).map(([key, val]) => [
              key,
              Number(val || 0),
            ])
          ),
        };
        const response = await API.patch(
          `/property-course/${isEditing?._id}`,
          payload
        );
        toast.success(response.data.message || "Course Edited Successfully");
        getPropertyCourse();
        setIsEditing("");
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  const handleAddBestFor = () => {
    const v = bestForInput.trim();
    if (!v) return;
    formik.setFieldValue("best_for", [...formik.values.best_for, v]);
    setBestForInput("");
  };

  const handleRemoveBestFor = (index: number) => {
    const updated = [...formik.values.best_for];
    updated.splice(index, 1);
    formik.setFieldValue("best_for", updated);
  };

  const handleAddLanguage = () => {
    const v = languagesInput.trim();
    if (!v) return;
    formik.setFieldValue("languages", [...formik.values.languages, v]);
    setLanguagesInput("");
  };

  const handleRemoveLanguage = (index: number) => {
    const updated = [...formik.values.languages];
    updated.splice(index, 1);
    formik.setFieldValue("languages", updated);
  };

  const handleAddPrice = () => {
    if (!priceInput) return;
    formik.setFieldValue("prices", {
      ...formik.values.prices,
      [priceCurrency]: Number(priceInput),
    });
    setPriceInput("");
  };

  const requirementOptions = requirements?.map((req: any) => ({
    value: String(req._id),
    label: req.requirment ?? "",
  }));

  const keyOutcomeOptions = keyOutcomes.map((ko: any) => ({
    value: String(ko._id),
    label: ko.key_outcome ?? "",
  }));

  const requirementValue = requirementOptions.filter((opt: any) =>
    formik.values.requirements.includes(opt.value)
  );

  const keyOutcomeValue = keyOutcomeOptions.filter((opt: any) =>
    formik.values.key_outcomes.includes(opt.value)
  );

  const courseTypeOptions = getCategoryAccodingToField(
    categories,
    "course type"
  );
  const certificationOptions = getCategoryAccodingToField(
    categories,
    "Certification Type"
  );

  const levelOptions = getCategoryAccodingToField(
    categories,
    "difficulty level"
  );
  const formatOptions = getCategoryAccodingToField(categories, "Course Format");

  return (
    <div>
      <div>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Select Course
              </label>
              <input
                type="text"
                name="course_name"
                value={formik.values.course_name}
                disabled
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />

              {getFormikError(formik, "course_name")}
            </div>

            {/* Course Short Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Course Short Name
              </label>
              <input
                type="text"
                name="course_short_name"
                value={formik.values.course_short_name}
                onChange={formik.handleChange}
                placeholder="Enter Short Name"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "course_short_name")}
            </div>

            {/* Course Type */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Course Type
              </label>
              <select
                name="course_type"
                value={formik.values.course_type}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Course Type</option>
                {courseTypeOptions.map((opt: any, idx: number) => (
                  <option key={idx} value={opt._id}>
                    {opt.category_name || opt.name}
                  </option>
                ))}
              </select>
              {getFormikError(formik, "course_type")}
            </div>

            {/* Course Format */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Course Format
              </label>
              <select
                name="course_format"
                value={formik.values.course_format}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Format</option>
                {formatOptions.map((opt: any, idx: number) => (
                  <option key={idx} value={opt._id}>
                    {opt.category_name || opt.name}
                  </option>
                ))}
              </select>
              {getFormikError(formik, "course_format")}
            </div>

            {/* Duration */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Duration Value
                </label>
                <input
                  type="number"
                  name="duration_value"
                  value={formik.values.duration_value}
                  onChange={formik.handleChange}
                  placeholder="Enter Duration"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                {getFormikError(formik, "duration_value")}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Duration Type
                </label>
                <select
                  name="duration_type"
                  value={formik.values.duration_type}
                  onChange={formik.handleChange}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                >
                  <option value="">Select Type</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
                {getFormikError(formik, "duration_type")}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Difficulty Level
              </label>
              <select
                name="course_level"
                value={formik.values.course_level}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Difficulty</option>
                {levelOptions.map((opt: any, idx: number) => (
                  <option key={idx} value={opt._id}>
                    {opt.category_name || opt.name}
                  </option>
                ))}
              </select>
              {getFormikError(formik, "course_level")}
            </div>

            {/* Certification Toggle */}
            <div>
              <ToggleButton
                label="Certification Available"
                enabled={formik.values.cerification_info}
                onToggle={() =>
                  formik.setFieldValue(
                    "cerification_info",
                    !formik.values.cerification_info
                  )
                }
              />
            </div>

            {/* Certification Type */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Certification Type
              </label>
              <select
                name="certification_type"
                value={formik.values.certification_type}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Certification</option>
                {certificationOptions.map((opt: any, idx: number) => (
                  <option key={idx} value={opt._id}>
                    {opt.category_name || opt.name}
                  </option>
                ))}
              </select>
              {getFormikError(formik, "certification_type")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Status
              </label>
              <select
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Certification</option>
                {getStatusAccodingToField(status, "Course").map(
                  (opt: any, idx: number) => (
                    <option key={idx} value={opt.parent_status}>
                      {opt.parent_status}
                    </option>
                  )
                )}
              </select>
              {getFormikError(formik, "status")}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Requirements
              </label>
              <Select
                isMulti
                name="requirements"
                options={requirementOptions}
                classNames={reactSelectDesignClass}
                value={requirementValue}
                onChange={(selected: any) =>
                  formik.setFieldValue(
                    "requirements",
                    (selected || []).map((s: any) => String(s.value))
                  )
                }
              />
            </div>

            {/* Key Outcomes */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Key Outcomes
              </label>
              <Select
                isMulti
                name="key_outcomes"
                options={keyOutcomeOptions}
                value={keyOutcomeValue}
                classNames={reactSelectDesignClass}
                onChange={(selected: any) =>
                  formik.setFieldValue(
                    "key_outcomes",
                    (selected || []).map((s: any) => String(s.value))
                  )
                }
              />
            </div>

            {/* Best For */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Best For
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={bestForInput}
                  onChange={(e) => setBestForInput(e.target.value)}
                  placeholder="Add who this course is best for"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                <button
                  type="button"
                  onClick={handleAddBestFor}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formik.values.best_for.map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="flex items-center px-3 py-1 bg-[var(--yp-tertiary)] bg-opacity-30 text-[var(--yp-text-primary)] rounded-full text-sm"
                  >
                    {item}
                    <X
                      className="ml-2 w-4 h-4 cursor-pointer"
                      onClick={() => handleRemoveBestFor(idx)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Languages
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={languagesInput}
                  onChange={(e) => setLanguagesInput(e.target.value)}
                  placeholder="Add language"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formik.values.languages.map((item: string, idx: number) => (
                  <span
                    key={idx}
                    className="flex items-center px-3 py-1 bg-[var(--yp-tertiary)] bg-opacity-30 text-[var(--yp-text-primary)] rounded-full text-sm"
                  >
                    {item}
                    <X
                      className="ml-2 w-4 h-4 cursor-pointer"
                      onClick={() => handleRemoveLanguage(idx)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="Enter Price"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                <select
                  value={priceCurrency}
                  onChange={(e) => setPriceCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                >
                  <option value="">Select Currency</option>
                  {currencyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddPrice}
                  className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
                >
                  Add
                </button>
              </div>
              <div className="col-span-1 md:col-span-3 flex flex-wrap gap-2 mt-2">
                {Object.entries(formik?.values?.prices).map(
                  ([currency, value]) =>
                    value && (
                      <span
                        key={currency}
                        className="flex items-center px-3 py-1 bg-[var(--yp-tertiary)] bg-opacity-30 text-[var(--yp-text-primary)] rounded-full text-sm"
                      >
                        {currency}: {value}
                        <X
                          className="ml-2 w-4 h-4 cursor-pointer"
                          onClick={() =>
                            formik.setFieldValue("prices", {
                              ...formik.values.prices,
                              [currency]: "",
                            })
                          }
                        />
                      </span>
                    )
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-start gap-2">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              Update Course
            </button>
            <button
              type="button"
              onClick={() => setIsEditing("")}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
