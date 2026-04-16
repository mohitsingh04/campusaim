import React, { useEffect, useState } from "react";
import { API } from "../../../services/API";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import LocationSkeleton from "./LocationSkeleton.jsx";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button/Button.jsx";
import FormInput from "../../../components/ui/Form/FormInput.jsx";

function Location() {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [location, setLocation] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* =========================
     Fetch Countries (once)
  ========================== */
  useEffect(() => {
    let mounted = true;

    const fetchCountries = async () => {
      try {
        const res = await API.get("/fetch-countries");
        if (mounted) setCountries(res?.data || []);
      } catch (err) {
        console.error("Countries fetch error:", err);
        toast.error("Failed to load countries");
      }
    };

    fetchCountries();
    return () => {
      mounted = false;
    };
  }, []);

  /* =========================
     Fetch User Location
  ========================== */
  useEffect(() => {
    if (!authUser?._id) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const fetchLocation = async () => {
      try {
        const res = await API.get(`/location/${authUser._id}`);
        if (mounted) setLocation(res?.data?.data || null);
      } catch (err) {
        const status = err?.response?.status;
        const msg = err?.response?.data?.error?.toLowerCase?.() || "";

        if (status === 404 || msg.includes("not found")) {
          setLocation(null);
        } else {
          console.error("Location fetch error:", err);
          toast.error("Failed to fetch location");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchLocation();
    return () => {
      mounted = false;
    };
  }, [authUser?._id]);

  /* =========================
     Validation Schema
  ========================== */
  const validationSchema = Yup.object({
    address: Yup.string().trim().required("Address is required."),
    pincode: Yup.string()
      .matches(/^\d{4,10}$/, "Invalid pincode")
      .required("Pincode is required."),
    country: Yup.string().required("Country is required."),
    state: Yup.string().required("State is required."),
    city: Yup.string().required("City is required."),
  });

  /* =========================
     Formik
  ========================== */
  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: true,
    initialValues: {
      userId: authUser?._id || "",
      address: location?.address || "",
      pincode: location?.pincode || "",
      country: location?.country || "",
      state: location?.state || "",
      city: location?.city || "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("Saving...");
      try {
        await API.put(`/location/${authUser?._id}`, values);
        toast.success("Updated successfully!", { id: toastId });
        navigate(0);
      } catch (error) {
        console.error("Save location error:", error);
        toast.error(
          error?.response?.data?.error ||
          "Something went wrong. Please try again.",
          { id: toastId }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  /* =========================
     Fetch States (lazy)
  ========================== */
  useEffect(() => {
    if (!formik.values.country) {
      setStates([]);
      setCities([]);
      return;
    }

    let mounted = true;

    const fetchStates = async () => {
      try {
        const res = await API.get(
          `/fetch-states?country=${encodeURIComponent(
            formik.values.country
          )}`
        );
        if (mounted) setStates(res?.data || []);
      } catch (err) {
        console.error("States fetch error:", err);
        toast.error("Failed to load states");
      }
    };

    fetchStates();
    return () => {
      mounted = false;
    };
  }, [formik.values.country]);

  /* =========================
     Fetch Cities (lazy)
  ========================== */
  useEffect(() => {
    if (!formik.values.state) {
      setCities([]);
      return;
    }

    let mounted = true;

    const fetchCities = async () => {
      try {
        const res = await API.get(
          `/fetch-city?state=${encodeURIComponent(formik.values.state)}`
        );
        if (mounted) setCities(res?.data || []);
      } catch (err) {
        console.error("Cities fetch error:", err);
        toast.error("Failed to load cities");
      }
    };

    fetchCities();
    return () => {
      mounted = false;
    };
  }, [formik.values.state]);

  if (!authUser || isLoading) return <LocationSkeleton />;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Location</h2>

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <FormInput
            label="Address"
            name="address"
            type="text"
            placeholder="Enter your address..."
            formik={formik}
          />

          {/* Pincode */}
          <FormInput
            label="Pincode"
            name="pincode"
            type="text"
            placeholder="Enter pincode..."
            formik={formik}
          />

          {/* Country */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Country
            </label>
            <select
              name="country"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={formik.values.country}
              onChange={(e) => {
                const value = e.target.value;
                formik.setFieldValue("country", value);
                formik.setFieldValue("state", "");
                formik.setFieldValue("city", "");
              }}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Country</option>
              {countries.map((item) => (
                <option key={item.id} value={item.country_name}>
                  {item.country_name}
                </option>
              ))}
            </select>
            {formik.touched.country && formik.errors.country && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.country}
              </p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium mb-2">
              State
            </label>
            <select
              name="state"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              value={formik.values.state}
              onChange={(e) => {
                const value = e.target.value;
                formik.setFieldValue("state", value);
                formik.setFieldValue("city", "");
              }}
              onBlur={formik.handleBlur}
              disabled={!formik.values.country}
            >
              <option value="">Select State</option>
              {states.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            {formik.touched.state && formik.errors.state && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.state}
              </p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium mb-2">
              City
            </label>
            <select
              name="city"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              {...formik.getFieldProps("city")}
              disabled={!formik.values.state}
            >
              <option value="">Select City</option>
              {cities.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            {formik.touched.city && formik.errors.city && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.city}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={formik.isSubmitting}
            disabled={
              formik.isSubmitting ||
              !formik.isValid ||
              !formik.dirty
            }
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

export default Location;
