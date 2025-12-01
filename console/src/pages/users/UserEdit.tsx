import { useCallback, useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import { useFormik } from "formik";
import { API } from "../../contexts/API";
import {
  CityProps,
  StateProps,
  UserProps,
  CountryProps,
  DashboardOutletContextProps,
} from "../../types/types";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { userEditValidation } from "../../contexts/ValidationsSchemas";
import { Breadcrumbs } from "../../ui/breadcrumbs/Breadcrumbs";
import {
  getErrorResponse,
  getFormikError,
  getStatusAccodingToField,
} from "../../contexts/Callbacks";
import toast from "react-hot-toast";
import { phoneInputClass } from "../../common/ExtraData";
import UserEditSkeleton from "../../ui/loadings/pages/UserEditSkeleton";

export function UserEdit() {
  const { objectId } = useParams();
  const redirector = useNavigate();
  const { status } = useOutletContext<DashboardOutletContextProps>();
  const [user, setUser] = useState<UserProps | null>(null);
  const [state, setState] = useState<StateProps[]>([]);
  const [city, setCity] = useState<CityProps[]>([]);
  const [country, setCountry] = useState<CountryProps[]>([]);
  const [filteredStates, setFilteredStates] = useState<StateProps[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<any>("");
  const { roles } = useOutletContext<DashboardOutletContextProps>();

  const getLocations = useCallback(async () => {
    try {
      const [cityRes, stateRes, countryRes] = await Promise.allSettled([
        API.get("/cities"),
        API.get("/states"),
        API.get("/countries"),
      ]);

      if (cityRes.status === "fulfilled") {
        setCity(cityRes.value.data || []);
      }
      if (stateRes.status === "fulfilled") {
        setState(stateRes.value.data || []);
      }
      if (countryRes.status === "fulfilled") {
        setCountry(countryRes.value.data || []);
      }
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getLocations();
  }, [getLocations]);

  const getUserDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/profile/user/${objectId}`);
      setUser(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  const getUserLocation = useCallback(async () => {
    if (!user?.uniqueId) return;
    try {
      const response = await API.get(`/profile/location/${user?.uniqueId}`);
      setUserLocation(response.data);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [user?.uniqueId]);

  useEffect(() => {
    getUserDetails();
    getUserLocation();
  }, [getUserDetails, getUserLocation]);

  // Formik
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      username: user?.username || "",
      name: user?.name || "",
      email: user?.email || "",
      mobile_no: user?.mobile_no || "",
      alt_mobile_no: user?.alt_mobile_no || "",
      pincode: userLocation?.pincode || "",
      address: userLocation?.address || "",
      country: userLocation?.country || "",
      state: userLocation?.state || "",
      city: userLocation?.city || "",
      role: user?.role || "",
      status: user?.status || "",
      verified: user?.verified || false,
    },
    validationSchema: userEditValidation,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const payload = { ...values };
        const locationPayload = {
          userId: user?.uniqueId,
          address: values?.address,
          pincode: values?.pincode,
          city: values?.city,
          state: values?.state,
          country: values?.country,
        };

        const response = await API.patch(
          `/profile/user/${objectId}/update`,
          payload
        );
        const LocationResponse = await API.patch(
          `/profile/location`,
          locationPayload
        );
        toast.success(response.data.message || "User updated successfully");
        toast.success(
          LocationResponse.data.message || "User updated successfully"
        );
        redirector(`/dashboard/user/${objectId}`);
        window.location.reload();
      } catch (error) {
        getErrorResponse(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    const filtred = state?.filter(
      (s) => s?.country_name === formik.values.country
    );
    setFilteredStates(filtred);
  }, [formik.values.country, state]);

  useEffect(() => {
    const filtred = city?.filter((s) => s?.state_name === formik.values.state);
    setFilteredCities(filtred);
  }, [formik.values.state, city]);

  const handleVerifiedToggle = () => {
    formik.setFieldValue("verified", !formik.values.verified);
  };

  if (loading) return <UserEditSkeleton />;

  return (
    <div className="space-y-6">
      <Breadcrumbs
        title="Edit User"
        breadcrumbs={[
          { label: "Dashboard", path: "/dashboard" },
          { label: "User", path: "/dashboard/users" },
          { label: user?.name || "", path: `/dashboard/user/${objectId}` },
          { label: "Edit" },
        ]}
      />

      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps("username")}
                  placeholder="Enter username"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                {getFormikError(formik, "username")}
              </div>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps("name")}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                {getFormikError(formik, "name")}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  {...formik.getFieldProps("email")}
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                {getFormikError(formik, "email")}
              </div>
              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Mobile Number
                </label>
                <PhoneInput
                  country="in"
                  value={String(formik.values.mobile_no || "")}
                  onChange={(phone) => formik.setFieldValue("mobile_no", phone)}
                  inputProps={{ name: "mobile_no", required: false }}
                  inputClass={phoneInputClass()?.input}
                  buttonClass={phoneInputClass()?.button}
                />
                {getFormikError(formik, "mobile_no")}
              </div>
              {/* Alt Mobile */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Alternate Mobile Number
                </label>
                <PhoneInput
                  country="in"
                  value={String(formik.values.alt_mobile_no || "")}
                  onChange={(phone) =>
                    formik.setFieldValue("alt_mobile_no", phone)
                  }
                  inputClass={phoneInputClass()?.input}
                  buttonClass={phoneInputClass()?.button}
                  inputProps={{
                    name: "alt_mobile_no",
                    required: false,
                  }}
                />
                {getFormikError(formik, "alt_mobile_no")}
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Address
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps("address")}
                  placeholder="Enter Address"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                {getFormikError(formik, "address")}
              </div>
              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  {...formik.getFieldProps("pincode")}
                  placeholder="Enter pincode"
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                />
                {getFormikError(formik, "pincode")}
              </div>
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Country
                </label>
                <select
                  {...formik.getFieldProps("country")}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                >
                  <option value="">Select Country</option>
                  {country?.map((c, index) => (
                    <option key={index} value={c?.country_name}>
                      {c?.country_name}
                    </option>
                  ))}
                </select>
                {getFormikError(formik, "country")}
              </div>
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  State
                </label>
                <select
                  {...formik.getFieldProps("state")}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                  disabled={!formik.values.country}
                >
                  <option value="">Select State</option>
                  {filteredStates?.map((s, index) => (
                    <option key={index} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {getFormikError(formik, "state")}
              </div>
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  City
                </label>
                <select
                  {...formik.getFieldProps("city")}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                  disabled={!formik.values.state}
                >
                  <option value="">Select City</option>
                  {filteredCities?.map((c, index) => (
                    <option key={index} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {getFormikError(formik, "city")}
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Role
                </label>
                <select
                  {...formik.getFieldProps("role")}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                >
                  <option value="" disabled>
                    -- Select Role --
                  </option>
                  {roles?.map((item, index) => (
                    <option value={item?._id} key={index}>
                      {item?.role}
                    </option>
                  ))}
                </select>
                {getFormikError(formik, "role")}
              </div>
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Status
                </label>
                <select
                  {...formik.getFieldProps("status")}
                  className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
                >
                  <option value="" disabled>
                    -- Select Status --
                  </option>
                  {getStatusAccodingToField(status, "user").map((s, index) => (
                    <option key={index} value={s.parent_status}>
                      {s.parent_status}
                    </option>
                  ))}
                </select>
                {getFormikError(formik, "status")}
              </div>
              {/* Verified Toggle */}
              <div className="flex items-center space-x-4 mt-4 md:col-span-2">
                <span className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
                  Verified User
                </span>
                <button
                  type="button"
                  onClick={handleVerifiedToggle}
                  className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors duration-300 focus:outline-none ${
                    formik.values.verified
                      ? "bg-[var(--yp-green-bg)]"
                      : "bg-[var(--yp-text-secondary)]"
                  }`}
                >
                  <span
                    className={`inline-block w-5 h-5 transform bg-[var(--yp-primary)] rounded-full shadow-md transition-transform duration-300 ${
                      formik.values.verified ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-start space-x-3 pt-6 border-t border-[var(--yp-border-primary)]">
            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="px-6 py-2 rounded-lg text-sm font-medium text-[var(--yp-blue-text)] bg-[var(--yp-blue-bg)]"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
