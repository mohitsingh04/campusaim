import { useFormik } from "formik";
import {
  CityProps,
  CountryProps,
  DashboardOutletContextProps,
  StateProps,
} from "../../../../types/types";
import { useEffect, useState } from "react";
import {
  getErrorResponse,
  getFormikError,
} from "../../../../contexts/Callbacks";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import { locationSettingValidation } from "../../../../contexts/ValidationsSchemas";

export default function LocationSettings() {
  const { authUser } = useOutletContext<DashboardOutletContextProps>();
  const [states, setStates] = useState<StateProps[]>([]);
  const [cities, setCities] = useState<CityProps[]>([]);
  const [countries, setCountries] = useState<CountryProps[]>([]);
  const [filteredStates, setFilteredStates] = useState<StateProps[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityProps[]>([]);

  // Fetch all location data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countryRes, stateRes, cityRes] = await Promise.all([
          API.get("/countries"),
          API.get("/states"),
          API.get("/cities"),
        ]);
        setCountries(countryRes.data);
        setStates(stateRes.data);
        setCities(cityRes.data);
      } catch (error) {
        getErrorResponse(error, true);
      }
    };
    fetchData();
  }, []);

  const formik = useFormik({
    initialValues: {
      userId: authUser?.uniqueId,
      address: authUser?.address || "",
      pincode: authUser?.pincode || "",
      country: authUser?.country || "",
      state: authUser?.state || "",
      city: authUser?.city || "",
    },
    enableReinitialize: true,
    validationSchema: locationSettingValidation,
    onSubmit: async (values) => {
      try {
        const response = await API.patch(`/profile/location`, values);
        toast.success(response.data.message);
      } catch (error) {
        getErrorResponse(error);
      }
    },
  });

  useEffect(() => {
    if (formik.values.country) {
      const statesFiltered = states.filter(
        (s) => s.country_name === formik.values.country
      );
      setFilteredStates(statesFiltered);
      setFilteredCities([]);
    }
  }, [formik.values.country, states]);

  useEffect(() => {
    if (formik.values.state) {
      const citiesFiltered = cities.filter(
        (c) => c.state_name === formik.values.state
      );
      setFilteredCities(citiesFiltered);
    }
  }, [formik.values.state, cities]);

  return (
    <div className="lg:col-span-3">
      <div className="bg-[var(--yp-primary)] rounded-xl shadow-sm">
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-[var(--yp-text-secondary)] mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter address"
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
              name="pincode"
              value={formik.values.pincode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
              name="country"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c.country_name} value={c.country_name}>
                  {c.country_name}
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
              name="state"
              value={formik.values.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={filteredStates.length === 0}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            >
              <option value="">Select state</option>
              {filteredStates.map((s) => (
                <option key={s.name} value={s.name}>
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
              name="city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={filteredCities.length === 0}
              className="w-full px-3 py-2 border border-[var(--yp-border-primary)] rounded-lg bg-[var(--yp-input-primary)] text-[var(--yp-text-primary)]"
            >
              <option value="">Select city</option>
              {filteredCities.map((ct) => (
                <option key={ct.name} value={ct.name}>
                  {ct.name}
                </option>
              ))}
            </select>
            {getFormikError(formik, "city")}
          </div>

          {/* Footer */}
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
