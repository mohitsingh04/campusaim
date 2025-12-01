import API from "@/contexts/API";
import { useFormik } from "formik";
import React from "react";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import {
  AllDegreeAndInstituteProps,
  EducationPayloadProps,
  EducationProps,
  UserProps,
} from "@/types/types";
import { formatToMonthInput } from "@/contexts/Callbacks";
import { AxiosError } from "axios";
import { ProfileEducationValidation } from "@/contexts/ValidationSchema";

export default function EducationForm({
  profile,
  onClose,
  editingItem,
  allDegreeAndInstitute,
  getProfile,
}: {
  profile: UserProps | null;
  onClose: () => void;
  editingItem: EducationProps | null;
  getProfile: () => void;
  allDegreeAndInstitute: AllDegreeAndInstituteProps | null;
}) {
  const degreeOptions = (allDegreeAndInstitute?.degree || []).map((deg) => ({
    value: deg.uniqueId,
    label: deg.degree_name,
    uniqueId: deg.uniqueId,
  }));

  const instituteOptions = (allDegreeAndInstitute?.institute || []).map(
    (inst) => ({
      value: inst.uniqueId,
      label: inst.institute_name,
      uniqueId: inst.uniqueId,
    })
  );
  const getInitialDegreeOption = () => {
    return (
      degreeOptions.find((opt) => opt.uniqueId === editingItem?.degree) || null
    );
  };

  const getInitialInstituteOption = () => {
    return (
      instituteOptions.find((opt) => opt.uniqueId === editingItem?.institute) ||
      null
    );
  };

  const formik = useFormik({
    initialValues: {
      userId: profile?.uniqueId || "",
      uniqueId: editingItem?.uniqueId || "",
      degreeSelect: getInitialDegreeOption(),
      instituteSelect: getInitialInstituteOption(),
      start_date: formatToMonthInput(editingItem?.start_date || ""),
      end_date: formatToMonthInput(editingItem?.end_date || ""),
      currentlyStuding: editingItem?.currentlyStuding || false,
    },
    validationSchema: ProfileEducationValidation,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload: EducationPayloadProps = {
        start_date: values.start_date,
        end_date: values.currentlyStuding ? null : values.end_date,
        currentlyStuding: values.currentlyStuding,
        userId: values?.userId,
        uniqueId: values?.uniqueId,
      };

      const selectedDegree = values.degreeSelect;
      if (selectedDegree) {
        const isExistingDegree = degreeOptions.find(
          (opt) => opt.value == selectedDegree.value
        );
        if (isExistingDegree) {
          payload.degreeId = selectedDegree.value;
        } else {
          payload.degree = selectedDegree.label;
        }
      }

      // Institute logic
      const selectedInstitute = values.instituteSelect;
      if (selectedInstitute) {
        const isExistingInstitute = instituteOptions.find(
          (opt) => opt.value === selectedInstitute.value
        );
        if (isExistingInstitute) {
          payload.instituteId = selectedInstitute.value;
        } else {
          payload.institute = selectedInstitute.label;
        }
      }

      try {
        const response = await API.post(`/profile/education`, payload);
        toast.success(response.data.message);
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        toast.error(err?.response?.data?.error || "Something went wrong");
      } finally {
        getProfile();
        onClose();
      }
    },
  });
  return (
    <div className="bg-purple-50 to-indigo-50 p-6 rounded-xl mb-6 border border-purple-200">
      <h3 className="text-lg font-semibold mb-4">
        {profile?.experiences?.find(
          (exp) => exp?.uniqueId === editingItem?.uniqueId
        )
          ? "Edit Education"
          : "Add New Education"}
      </h3>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Degree
            </label>
            <CreatableSelect
              isClearable
              options={degreeOptions}
              value={formik.values.degreeSelect}
              onChange={(option) =>
                formik.setFieldValue("degreeSelect", option)
              }
            />
            {formik.touched.degreeSelect &&
              typeof formik.errors.degreeSelect === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.degreeSelect}
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Institute
            </label>
            <CreatableSelect
              isClearable
              options={instituteOptions}
              value={formik.values.instituteSelect}
              onChange={(option) =>
                formik.setFieldValue("instituteSelect", option)
              }
            />
            {formik.touched.instituteSelect &&
              typeof formik.errors.instituteSelect === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.instituteSelect}
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="month"
              className="w-full px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="e.g., Computer Science"
              {...formik.getFieldProps("start_date")}
            />
            {formik.touched.start_date &&
              typeof formik.errors.start_date === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.start_date}
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="month"
              {...formik.getFieldProps("end_date")}
              disabled={formik.values.currentlyStuding}
              className="w-full px-4 py-3 disabled:bg-gray-300 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              placeholder="e.g., 3.8 GPA"
            />{" "}
            {formik.touched.end_date &&
              typeof formik.errors.end_date === "string" && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.end_date}
                </p>
              )}
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formik.values.currentlyStuding}
                {...formik.getFieldProps("currentlyStuding")}
                className="rounded border-purple-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span className="ml-2 text-sm text-gray-700 font-medium">
                I currently Study here (Pursuing)
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="py-2 bg-purple-200 hover:bg-purple-600 rounded-xl px-6 border-2 border-purple-600  hover:text-white font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
