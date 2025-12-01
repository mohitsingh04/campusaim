import PhoneInput from "react-phone-input-2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useOutletContext } from "react-router-dom";
import { DashboardOutletContextProps } from "../../../../types/types";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { phoneInputClass } from "../../../../common/ExtraData";

export default function GeneralSettings() {
  const { authUser } = useOutletContext<DashboardOutletContextProps>();

  const formik = useFormik({
    initialValues: {
      username: authUser?.username || "",
      name: authUser?.name || "",
      email: authUser?.email || "",
      mobile_no: authUser?.mobile_no || "",
      alt_mobile_no: authUser?.alt_mobile_no || "",
      address: authUser?.address || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      name: Yup.string().required("Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      mobile_no: Yup.string().required("Mobile number is required"),
      alt_mobile_no: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        const response = await API.patch(
          `/profile/user/${authUser?._id}`,
          values
        );
        toast.success(response.data.message);
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  return (
    <div className="lg:col-span-3">
      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "username")}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "name")}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            />
            {getFormikError(formik, "email")}
          </div>

          {/* Mobile No */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Mobile No
            </label>
            <PhoneInput
              country="in"
              value={formik.values.mobile_no}
              onChange={(mobile_no) =>
                formik.setFieldValue("mobile_no", mobile_no)
              }
              inputClass={phoneInputClass()?.input}
              buttonClass={phoneInputClass()?.button}
            />
            {getFormikError(formik, "mobile_no")}
          </div>

          {/* Alternate Mobile No */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Alternate Mobile No
            </label>
            <PhoneInput
              country="in"
              value={formik.values.alt_mobile_no?.toString()}
              onChange={(alt_mobile_no) =>
                formik.setFieldValue("alt_mobile_no", alt_mobile_no)
              }
              inputClass={phoneInputClass()?.input}
              buttonClass={phoneInputClass()?.button}
              dropdownClass={phoneInputClass()?.dropdown}
            />
            {getFormikError(formik, "alt_mobile_no")}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              {formik.isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
