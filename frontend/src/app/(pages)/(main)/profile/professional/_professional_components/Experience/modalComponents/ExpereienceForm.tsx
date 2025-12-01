import {
  ExperienceProps,
  FormattedOptionsProps,
  PropertyProps,
  UserProps,
} from "@/types/types";
import CreatableSelect from "react-select/creatable";
import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import API from "@/contexts/API";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ProfileExperienceValidation } from "@/contexts/ValidationSchema";

export default function ExpereienceForm({
  profile,
  editingItem,
  onClose,
  getProfile,
  properties,
}: {
  profile: UserProps | null;
  editingItem: ExperienceProps;
  onClose: () => void;
  getProfile: () => void;
  properties: PropertyProps[];
}) {
  const [companySelectOptions, setCompanySelectOptions] = useState<
    FormattedOptionsProps[]
  >([]);

  useEffect(() => {
    if (properties) {
      const formattedOptions = properties?.map((property) => ({
        label: property.property_name,
        value: property.property_name,
        id: property.uniqueId,
      }));
      setCompanySelectOptions(formattedOptions);
    }
  }, [properties]);

  const formatToMonthInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const formik = useFormik({
    initialValues: {
      uniqueId: editingItem?.uniqueId || "",
      userId: profile?.uniqueId || "",
      position: editingItem?.position || "",
      property_id: editingItem?.property_id || null,
      property_name: editingItem?.property_name || "",
      location: editingItem?.location || "",
      currentlyWorking: editingItem?.currentlyWorking || false,
      start_date: formatToMonthInput(editingItem?.start_date),
      end_date: formatToMonthInput(editingItem?.end_date),
    },
    validationSchema: ProfileExperienceValidation,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!values?.property_id && !values.property_name) {
        toast.error("Have To Select Company");
        return;
      }
      const payload = {
        ...values,
        property_id: values.property_id || null,
        property_name: values.property_id ? "" : values.property_name,
      };

      try {
        const response = await API.post(`/profile/experience`, payload);
        toast.success(response.data.message);
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        toast.error(err.response?.data?.error || "Something went wrong.");
      } finally {
        getProfile();
        onClose();
      }
    },
  });

  const handleCompanyChange = (option: FormattedOptionsProps | null) => {
    if (option && option.id) {
      formik.setFieldValue("property_name", "");
      formik.setFieldValue("property_id", option.id);
    } else if (option) {
      formik.setFieldValue("property_name", option.value);
      formik.setFieldValue("property_id", null);
    } else {
      formik.setFieldValue("property_name", "");
      formik.setFieldValue("property_id", null);
    }
  };

  const handleCompanyCreate = (inputValue: string) => {
    formik.setFieldValue("property_name", inputValue);
    formik.setFieldValue("property_id", null);
  };
  return (
    <div>
      <div className="bg-purple-50 to-indigo-50 p-6 rounded-xl mb-6 border border-purple-200">
        <h3 className="text-lg font-semibold mb-4">
          {profile?.experiences?.find(
            (exp) => exp?.uniqueId === editingItem?.uniqueId
          )
            ? "Edit Experience"
            : "Add New Experience"}
        </h3>

        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Position *
              </label>
              <input
                type="text"
                {...formik.getFieldProps("position")}
                className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="e.g., Web Developer"
              />
              {formik.touched.position && formik.errors.position && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.position}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Company *
              </label>
              <CreatableSelect
                options={companySelectOptions.filter(
                  (opt) =>
                    !formik.values.property_name ||
                    opt.value !== formik.values.property_name
                )}
                onChange={handleCompanyChange}
                onCreateOption={handleCompanyCreate}
                value={
                  formik.values.property_id
                    ? companySelectOptions.find(
                        (option) => option?.id === formik.values.property_id
                      ) || null
                    : formik.values.property_name
                    ? {
                        label: formik.values.property_name,
                        value: formik.values.property_name,
                      }
                    : null
                }
                isClearable
              />{" "}
              {formik.touched.property_id && formik.errors.property_id && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.property_id}
                </p>
              )}
              {formik.touched.property_name && formik.errors.property_name && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.property_name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                {...formik.getFieldProps("location")}
                className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                placeholder="e.g., Dehradun"
              />
              {formik.touched.location && formik.errors.location && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.location}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="month"
                {...formik.getFieldProps("start_date")}
                className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
              {formik.touched.start_date && formik.errors.start_date && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.start_date}
                </p>
              )}
            </div>
            {!formik.values.currentlyWorking && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="month"
                  {...formik.getFieldProps("end_date")}
                  disabled={formik.values.currentlyWorking}
                  className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
                {formik.touched.end_date && formik.errors.end_date && (
                  <p className="text-xs text-red-500 mt-1">
                    {formik.errors.end_date}
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formik.values.currentlyWorking}
                {...formik.getFieldProps("currentlyWorking")}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">
                I currently work here
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="py-2 bg-purple-200 hover:bg-purple-600 rounded-xl px-6 border-2 border-purple-600  hover:text-white font-medium"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
