import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import JoditEditor from "jodit-react";
import { API } from "../../../../contexts/API";
import { SimpleTable, Column } from "../../../../ui/tables/SimpleTable";
import {
  formatToAmPm,
  getCategoryAccodingToField,
  getErrorResponse,
  getFormikError,
  isEndTimeAfterStartTime,
} from "../../../../contexts/Callbacks";
import {
  DashboardOutletContextProps,
  PropertyProps,
  RetreatProps,
} from "../../../../types/types";
import { useOutletContext } from "react-router-dom";
import {
  currencyOptions,
  reactSelectDesignClass,
} from "../../../../common/ExtraData";
import { PropertyRetreatValidation } from "../../../../contexts/ValidationsSchemas";
import { getEditorConfig } from "../../../../contexts/JoditEditorConfig";
import ToggleButton from "../../../../ui/button/ToggleButton";

interface RoutineItem {
  start_time: string;
  end_time: string;
  task: string;
}

export default function AddRetreatForm({
  allRetreats,
  property,
  onsubmit,
  setIsAdding,
  requirements,
  keyoutcomes,
}: {
  allRetreats: RetreatProps[];
  property: PropertyProps | null;
  onsubmit: () => void;
  setIsAdding: any;
  keyoutcomes: any;
  requirements: any;
}) {
  const [routine, setRoutine] = useState<RoutineItem[]>([]);
  const editorConfig = useMemo(() => getEditorConfig(), []);
  const [tempRoutine, setTempRoutine] = useState<RoutineItem>({
    start_time: "",
    end_time: "",
    task: "",
  });
  const { categories } = useOutletContext<DashboardOutletContextProps>();

  const [bestForList, setBestForList] = useState<string[]>([]);
  const [bestForInput, setBestForInput] = useState("");
  const [priceList, setPriceList] = useState<{ [currency: string]: number }>(
    {}
  );
  const [priceInput, setPriceInput] = useState({ currency: "", amount: "" });
  const [requirementOptions, setRequirementOptions] = useState<any[]>([]);
  const [outcomeOptions, setOutcomeOptions] = useState<any[]>([]);

  useEffect(() => {
    setRequirementOptions(
      requirements?.map((r: any) => ({
        value: r._id,
        label: r.requirment,
      }))
    );
  }, [requirements]);

  useEffect(() => {
    setOutcomeOptions(
      keyoutcomes?.map((ko: any) => ({
        value: ko._id,
        label: ko.key_outcome,
      }))
    );
  }, [keyoutcomes]);

  const addRoutineItem = () => {
    if (!tempRoutine.start_time || !tempRoutine.end_time || !tempRoutine.task) {
      Swal.fire("Error", "Please fill all Daily Routine fields", "error");
      return;
    }
    if (
      !isEndTimeAfterStartTime(tempRoutine.start_time, tempRoutine.end_time)
    ) {
      Swal.fire("Error", "End time must be after start time", "error");
      return;
    }
    setRoutine([...routine, tempRoutine]);
    setTempRoutine({ start_time: "", end_time: "", task: "" });
  };

  const removeRoutineItem = (index: number) => {
    setRoutine(routine.filter((_, i) => i !== index));
  };

  const columns: Column<RoutineItem>[] = [
    { label: "Start Time", value: (row) => formatToAmPm(row.start_time) },
    { label: "End Time", value: (row) => formatToAmPm(row.end_time) },
    { label: "Task", value: "task" },
    {
      label: "Action",
      value: (row) => (
        <button
          type="button"
          onClick={() => removeRoutineItem(routine.indexOf(row))}
          className="px-6 py-2 ms-1 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
        >
          Remove
        </button>
      ),
    },
  ];

  const formik = useFormik({
    initialValues: {
      property_id: property?._id || "",
      retreat_id: "",
      retreat_short_name: "",
      description: "",
      retreat_type: "",
      retreat_format: "",
      retreat_difficulty_level: "",
      retreat_certification_type: "",
      capacity: "",
      cancellation_policy: "",
      duration_type: "",
      duration_value: "",
      certification_available: false,
      requirements: [],
      key_outcomes: [],
      best_for: [],
      languages: [],
      price: [],
      booking_deadline: "",
      start_date: "",
      end_date: "",
      accommodation: [],
      featured_image: null,
      inclusions: "",
      exclusions: "",
    },
    enableReinitialize: true,
    validationSchema: PropertyRetreatValidation,
    onSubmit: async (values) => {
      if (bestForList.length === 0) {
        Swal.fire("Error", "Please add at least one Best For item", "error");
        return;
      }
      if (Object.keys(priceList).length === 0) {
        Swal.fire("Error", "Please add at least one Price item", "error");
        return;
      }

      const formData = new FormData();
      formData.append("property_id", property?._id || "");
      formData.append("retreat_id", values.retreat_id);
      formData.append("retreat_short_name", values.retreat_short_name);
      formData.append("description", values.description);
      formData.append("retreat_type", values.retreat_type);
      formData.append("retreat_format", values.retreat_format);
      formData.append(
        "retreat_difficulty_level",
        values.retreat_difficulty_level
      );
      formData.append(
        "retreat_certification_type",
        values.retreat_certification_type
      );
      formData.append("capacity", values.capacity);
      formData.append("cancellation_policy", values.cancellation_policy);
      formData.append(
        "duration",
        `${values.duration_value} ${values.duration_type}`
      );
      formData.append(
        "certification_available",
        values?.certification_available
      );
      formData.append("best_for", JSON.stringify(bestForList));
      formData.append("price", JSON.stringify(priceList));
      formData.append("booking_deadline", values.booking_deadline);
      formData.append("start_date", values.start_date);
      formData.append("end_date", values.end_date);
      formData.append("inclusions", values.inclusions);
      formData.append("exclusions", values.exclusions);
      formData.append("routine", JSON.stringify(routine));
      formData.append(
        "requirements",
        JSON.stringify(values?.requirements.map((r: any) => r.value))
      );
      formData.append(
        "key_outcomes",
        JSON.stringify(values?.key_outcomes.map((o: any) => o.value))
      );
      formData.append(
        "languages",
        JSON.stringify(
          values.languages.map((l: any) => l.value || l.label || l)
        )
      );
      formData.append(
        "accommodation",
        JSON.stringify(
          values.accommodation.map((a: any) => a.value || a.label || a)
        )
      );
      if (values.featured_image) {
        formData.append("featured_image", values.featured_image);
      }

      try {
        const response = await API.post("/property-retreat", formData);
        toast.success(response.data.message || "Retreat created successfully");
        onsubmit();
        setIsAdding(false);
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  useEffect(() => {
    const retreat =
      allRetreats.find((r) => r._id === formik.values.retreat_id) || null;

    if (retreat) {
      formik.setValues({
        property_id: property?._id || "",
        retreat_id: String(retreat._id),
        retreat_short_name: retreat.retreat_short_name || "",
        description: retreat.description || "",
        retreat_type: retreat.retreat_type || "",
        retreat_format: retreat.retreat_format || "",
        retreat_difficulty_level: retreat.retreat_difficulty_level || "",
        retreat_certification_type: retreat.retreat_certification_type || "",
        capacity: retreat.capacity || "",
        cancellation_policy: retreat.cancellation_policy || "",
        duration_type: retreat.duration?.split(" ")?.[1] || "",
        duration_value: retreat.duration?.split(" ")?.[0] || "",
      });
    }
  }, [formik.values.retreat_id, allRetreats, property?._id]);

  return (
    <div>
      <div>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Retreat Name & Short Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Retreat Name
              </label>
              <select
                name="retreat_id"
                value={formik.values.retreat_id}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Retreat</option>
                {allRetreats.map((retreat) => (
                  <option key={retreat._id} value={retreat._id}>
                    {retreat.retreat_name}
                  </option>
                ))}
              </select>
              {getFormikError(formik, "retreat_id")}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Retreat Short Name
              </label>
              <input
                type="text"
                name="retreat_short_name"
                value={formik.values.retreat_short_name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter short name"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "retreat_short_name")}
            </div>

            {/* Retreat Type */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Retreat Type
              </label>
              <select
                name="retreat_type"
                value={formik.values.retreat_type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Type</option>
                {getCategoryAccodingToField(categories, "Retreat Type").map(
                  (retreat) => (
                    <option key={retreat._id} value={retreat._id}>
                      {retreat.category_name}
                    </option>
                  )
                )}
              </select>
              {getFormikError(formik, "retreat_type")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Retreat Format
              </label>
              <select
                name="retreat_format"
                value={formik.values.retreat_format}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Format</option>
                {getCategoryAccodingToField(categories, "Course Format").map(
                  (retreat) => (
                    <option key={retreat._id} value={retreat._id}>
                      {retreat.category_name}
                    </option>
                  )
                )}
              </select>
              {getFormikError(formik, "retreat_format")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Retreat Difficulty Level
              </label>
              <select
                name="retreat_difficulty_level"
                value={formik.values.retreat_difficulty_level}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Difficulty Level</option>
                {getCategoryAccodingToField(categories, "difficulty level").map(
                  (retreat) => (
                    <option key={retreat._id} value={retreat._id}>
                      {retreat.category_name}
                    </option>
                  )
                )}
              </select>
              {getFormikError(formik, "retreat_difficulty_level")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Retreat Certification Type
              </label>
              <select
                name="retreat_certification_type"
                value={formik.values.retreat_certification_type}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              >
                <option value="">Select Certification Type</option>
                {getCategoryAccodingToField(
                  categories,
                  "certification type"
                ).map((retreat) => (
                  <option key={retreat._id} value={retreat._id}>
                    {retreat.category_name}
                  </option>
                ))}
              </select>
              {getFormikError(formik, "retreat_certification_type")}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formik.values.capacity}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter capacity"
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "capacity")}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Booking Deadline
              </label>
              <input
                type="date"
                name="booking_deadline"
                value={formik.values.booking_deadline}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "booking_deadline")}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formik.values.start_date}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "start_date")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formik.values.end_date}
                onChange={formik.handleChange}
                className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
              />
              {getFormikError(formik, "end_date")}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Price
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                  value={priceInput.amount}
                  onChange={(e) =>
                    setPriceInput({ ...priceInput, amount: e.target.value })
                  }
                />
                <select
                  value={priceInput.currency}
                  onChange={(e) =>
                    setPriceInput({ ...priceInput, currency: e.target.value })
                  }
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
                  onClick={() => {
                    if (priceInput.amount && priceInput.currency) {
                      const newPriceList = {
                        ...priceList,
                        [priceInput.currency]: Number(priceInput.amount),
                      };
                      setPriceList(newPriceList);
                      formik.setFieldValue("price", newPriceList);
                      setPriceInput({ currency: "", amount: "" });
                    }
                  }}
                  className="px-6 py-2 ms-1 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
                >
                  Add
                </button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {Object.entries(priceList).map(([currency, amount]) => (
                  <span
                    key={currency}
                    className="flex items-center gap-1 bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] px-3 py-1 rounded-full text-sm"
                  >
                    {currency}: {amount}
                    <button
                      type="button"
                      onClick={() => {
                        const updatedPriceList = { ...priceList };
                        delete updatedPriceList[currency];
                        setPriceList(updatedPriceList);
                        formik.setFieldValue("price", updatedPriceList);
                      }}
                      className="ml-1 text-xs font-bold hover:text-[var(--yp-red-bg)]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Best For
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bestForInput}
                  onChange={(e) => setBestForInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (bestForInput.trim()) {
                      setBestForList([...bestForList, bestForInput]);
                      formik.setFieldValue("best_for", [
                        ...bestForList,
                        bestForInput,
                      ]);
                      setBestForInput("");
                    }
                  }}
                  className="px-6 py-2 ms-1 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
                >
                  Add
                </button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {bestForList.map((item, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 bg-[var(--yp-blue-bg)] text-[var(--yp-blue-text)] px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => {
                        const updatedList = bestForList.filter(
                          (_, i) => i !== idx
                        );
                        setBestForList(updatedList);
                        formik.setFieldValue("best_for", updatedList);
                      }}
                      className="ml-1 text-xs font-bold hover:text-[var(--yp-red-bg)]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Requirements
              </label>
              <Select
                isMulti
                name="requirements"
                options={requirementOptions}
                value={formik.values.requirements}
                onChange={(val) => formik.setFieldValue("requirements", val)}
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "requirements")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Key Outcomes / Benefits
              </label>
              <Select
                isMulti
                name="key_outcomes"
                options={outcomeOptions}
                value={formik.values.key_outcomes}
                onChange={(val) => formik.setFieldValue("key_outcomes", val)}
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "key_outcomes")}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Languages
              </label>
              <CreatableSelect
                isMulti
                name="languages"
                value={formik.values.languages}
                onChange={(val) => formik.setFieldValue("languages", val)}
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "languages")}
            </div>

            {/* Accommodation */}
            <div>
              <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                Accommodation
              </label>
              <CreatableSelect
                isMulti
                name="accommodation"
                value={formik.values.accommodation}
                onChange={(val) => formik.setFieldValue("accommodation", val)}
                classNames={reactSelectDesignClass}
              />
              {getFormikError(formik, "accommodation")}
            </div>

            {/* Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Duration Value
                </label>
                <input
                  type="number"
                  name="duration_value"
                  value={formik.values.duration_value}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter duration (e.g. 7)"
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
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                >
                  <option value="">Select Duration Type</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
                {getFormikError(formik, "duration_type")}
              </div>
            </div>
          </div>

          <div>
            <ToggleButton
              label="Certification Available"
              enabled={formik.values.certification_available}
              onToggle={() =>
                formik.setFieldValue(
                  "certification_available",
                  !formik.values.certification_available
                )
              }
            />
            {getFormikError(formik, "certification_available")}
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Featured Image
            </label>
            <input
              type="file"
              accept=".jpg,.png"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) {
                  formik.setFieldValue("featured_image", file);
                }
              }}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)] file:bg-[var(--yp-tertiary)] file:border-0 file:px-3 file:py-2 file:rounded-lg file:text-[var(--yp-text-primary)] file:cursor-pointer"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Inclusions
            </label>
            <JoditEditor
              value={formik.values.inclusions}
              config={editorConfig}
              onBlur={(newContent) =>
                formik.setFieldValue("inclusions", newContent)
              }
              onChange={(newContent) =>
                formik.setFieldValue("inclusions", newContent)
              }
            />
            {getFormikError(formik, "inclusions")}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Exclusions
            </label>
            <JoditEditor
              value={formik.values.exclusions}
              config={editorConfig}
              onBlur={(newContent) =>
                formik.setFieldValue("exclusions", newContent)
              }
              onChange={(newContent) =>
                formik.setFieldValue("exclusions", newContent)
              }
            />
            {getFormikError(formik, "exclusions")}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Description
            </label>
            <JoditEditor
              value={formik.values.description}
              config={editorConfig}
              onBlur={(newContent) =>
                formik.setFieldValue("description", newContent)
              }
              onChange={(newContent) =>
                formik.setFieldValue("description", newContent)
              }
            />
            {getFormikError(formik, "description")}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Cancellation Policy
            </label>
            <JoditEditor
              value={formik.values.cancellation_policy}
              config={editorConfig}
              onBlur={(newContent) =>
                formik.setFieldValue("cancellation_policy", newContent)
              }
              onChange={(newContent) =>
                formik.setFieldValue("cancellation_policy", newContent)
              }
            />
            {getFormikError(formik, "cancellation_policy")}
          </div>

          {/* routine Section */}
          <div>
            <h3 className="block text-lg font-medium text-[var(--yp-text-secondary)] mb-2">
              Daily Routine
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={tempRoutine.start_time}
                  onChange={(e) =>
                    setTempRoutine({
                      ...tempRoutine,
                      start_time: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={tempRoutine.end_time}
                  onChange={(e) =>
                    setTempRoutine({
                      ...tempRoutine,
                      end_time: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Task
                </label>
                <input
                  type="text"
                  value={tempRoutine.task}
                  onChange={(e) =>
                    setTempRoutine({ ...tempRoutine, task: e.target.value })
                  }
                  placeholder="Enter task"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addRoutineItem}
                  className="px-6 py-2 ms-1 rounded-lg text-sm font-medium text-[var(--yp-green-text)] bg-[var(--yp-green-bg)]"
                >
                  Add
                </button>
              </div>
            </div>

            {routine.length > 0 && (
              <div className="mt-4">
                <SimpleTable data={routine} columns={columns} />
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-start">
            <button
              type="submit"
              className="px-6 py-2 ms-1 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              Submit Retreat
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-6 py-2 ms-1 rounded-lg text-sm font-medium text-[var(--yp-red-text)] bg-[var(--yp-red-bg)]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
