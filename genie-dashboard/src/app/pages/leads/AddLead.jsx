import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { ChevronDown, ArrowLeft, User, MapPin, GraduationCap, Settings } from "lucide-react";
import { API, CampusaimAPI } from "../../services/API";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import PhoneInput from "../../components/formInputs/PhoneInput";
import { useAuth } from "../../context/AuthContext";
import { FORM_SCHEMA } from "./AccordionData/form.schema";
import SectionRenderer from "./AccordionData/SectionRenderer";

/* ============================
   Validation & Initial Values
============================ */
const currentYear = new Date().getFullYear();

const validationSchema = Yup.object({
    name: Yup.string().trim().required("Name is required"),

    contact: Yup.string()
        .required("Contact is required")
        .matches(/^(\+91)?[6-9]\d{9}$/, "Invalid Indian contact number"),

    // ✅ 1. DOB (NO FUTURE DATE)
    dob: Yup.date()
        .nullable()
        .max(new Date(), "DOB cannot be in the future")
        .typeError("Invalid date"),

    // ✅ 2. PINCODE (6 DIGIT INDIA)
    pincode: Yup.string()
        .nullable()
        .matches(/^\d{6}$/, "Pincode must be 6 digits")
        .when("country", {
            is: (val) => val === "India",
            then: (schema) => schema.required("Pincode is required"),
            otherwise: (schema) => schema.notRequired()
        }),

    // ✅ 3. ACADEMICS
    academics: Yup.object({
        passingYear: Yup.number()
            .nullable()
            .typeError("Passing year must be a number")
            .min(1950, "Invalid year")
            .max(currentYear, "Passing year cannot be in future"),

        percentage: Yup.number()
            .nullable()
            .typeError("Percentage must be a number")
            .min(0, "Minimum is 0%")
            .max(100, "Maximum is 100%"),

        qualification: Yup.string().nullable(),
        boardOrUniversity: Yup.string().nullable(),
        stream: Yup.string().nullable()
    }),

    // ✅ 4. SCHOOL (OPTIONAL % VALIDATION)
    school: Yup.object({
        currentName: Yup.string().nullable(),

        percentage: Yup.number()
            .nullable()
            .typeError("Percentage must be a number")
            .min(0, "Minimum is 0%")
            .max(100, "Maximum is 100%")
    }),

    // ✅ OPTIONAL: EMAIL HARDENING
    email: Yup.string()
        .nullable()
        .email("Invalid email format"),
});

const initialValues = {
    name: "",
    contact: "",
    countryCode: "+91",
    email: "",
    alternateContact: "",
    gender: "",
    dob: "",

    address: "",
    pincode: "",
    country: "",
    state: "",
    city: "",

    school: {
        currentName: "",
        currentLocation: "",
        board: "",
        currentClass: "",
        session: "",
        percentage: ""
    },

    academics: {
        qualification: "",
        boardOrUniversity: "",
        passingYear: "",
        percentage: "",
        stream: "",
        currentClass: "",
        board: ""
    },

    exam: {
        examType: [],
        location: "",
        mode: "",
        batch: "",
        hostel: "",
        transport: ""
    },

    preferences: {
        preferredProperty: "",
        preferredCourse: "",
        preferredCountry: "",
        preferredState: "",
        preferredCity: "",
        collegeType: "Any",
        preferredSchool: "",
        schoolType: "",
        location: "",
        admissionClass: "",
        session: "",
        hostel: ""
    }
};

/* ============================
   Main Component
============================ */
const AddLead = () => {
    const { authUser } = useAuth();
    const navigate = useNavigate();
    const [openSection, setOpenSection] = useState("basic");
    const [property, setProperty] = useState([]);
    const [course, setCourse] = useState([]);
    const [propertyCourse, setPropertyCourse] = useState([]);
    const [countries, setCountries] = useState([]);
    const [category, setCategory] = useState([]);

    // Address location
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    // Preferences location
    const [prefStates, setPrefStates] = useState([]);
    const [prefCities, setPrefCities] = useState([]);

    const categoryId = authUser?.nicheId;
    const myCategory = category.filter((a) => a?._id === categoryId);

    const categoryKeyMap = {
        School: "school",
        College: "college_university",
        University: "college_university",
        Coaching: "coaching"
    };

    const categoryName = myCategory?.[0]?.category_name;
    const categoryKey = categoryKeyMap[categoryName] || "college_university";

    const fetchProperties = async () => {
        try {
            const res = await CampusaimAPI.get("/property");
            const property = res?.data;
            setProperty(property);
        } catch (error) {
            toast.error("Internal server error.");
            console.error(error)
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await CampusaimAPI.get("/course");
            const course = res?.data;
            setCourse(course);
        } catch (error) {
            toast.error("Internal server error.");
            console.error(error)
        }
    };

    const fetchPropertyCourses = async () => {
        try {
            const res = await CampusaimAPI.get("/property-course");
            const course = res?.data;
            setPropertyCourse(course);
        } catch (error) {
            toast.error("Internal server error.");
            console.error(error)
        }
    };

    const fetchCountries = async () => {
        try {
            const res = await API.get("/fetch-countries");
            setCountries(res?.data || []);
        } catch (err) {
            console.error("Countries fetch error:", err);
            toast.error("Failed to load countries");
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await CampusaimAPI.get("/category");
                const filteredCat = res.data.filter((a) => a.parent_category === "Academic Type");
                setCategory(filteredCat);
            } catch (error) {
                toast.error("Internal server error.");
                console.error(error)
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (categoryKey === "college_university") {
            fetchProperties();
            fetchCourses();
            fetchPropertyCourses();
        }

        fetchCountries();
    }, [categoryKey]);

    // ================= FORMik FIRST =================
    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const payload = {
                    ...values,
                    category: categoryId,

                    property_id: values.preferences?.preferredProperty || "",
                    course_id: values.preferences?.preferredCourse || "",

                    // ✅ ADD THESE
                    custom_property_name:
                        values.preferences?.preferredProperty === "__other__"
                            ? values.preferences?.preferredProperty_other || ""
                            : "",

                    custom_course_name:
                        values.preferences?.preferredCourse === "__other__"
                            ? values.preferences?.preferredCourse_other || ""
                            : "",

                    contact: `${values.countryCode || "+91"}${values.contact}`,
                    alternateContact: values.alternateContact
                        ? `${values.countryCode || "+91"}${values.alternateContact}`
                        : "",
                };

                await API.post("/leads", payload);
                toast.success("Lead added successfully");
                navigate("/dashboard/leads/all");
            } catch (error) {
                console.log(error);
                toast.error(error?.response?.data?.error || "Something went wrong!");
            } finally {
                setSubmitting(false);
            }
        },
    });

    useEffect(() => {
        if (formik.values.category) {
            setOpenSection("basic");
        }
    }, [formik.values.category]);

    useEffect(() => {
        if (!formik.values.country) {
            setStates([]);
            setCities([]);
            return;
        }

        const fetchStates = async () => {
            try {
                const res = await API.get(
                    `/fetch-states?country=${encodeURIComponent(formik.values.country)}`
                );
                setStates(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                toast.error("Failed to load states");
            }
        };

        fetchStates();
    }, [formik.values.country]);

    useEffect(() => {
        if (!formik.values.state) {
            setCities([]);
            return;
        }

        const fetchCities = async () => {
            try {
                const res = await API.get(
                    `/fetch-city?state=${encodeURIComponent(formik.values.state)}`
                );
                setCities(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                toast.error("Failed to load cities");
            }
        };

        fetchCities();
    }, [formik.values.state]);

    useEffect(() => {
        if (!formik.values.preferences.preferredCountry) {
            setPrefStates([]);
            setPrefCities([]);
            return;
        }

        const fetchPrefStates = async () => {
            try {
                const res = await API.get(
                    `/fetch-states?country=${encodeURIComponent(
                        formik.values.preferences.preferredCountry
                    )}`
                );
                setPrefStates(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                toast.error("Failed to load states");
            }
        };

        fetchPrefStates();
    }, [formik.values.preferences.preferredCountry]);

    useEffect(() => {
        if (!formik.values.preferences.preferredState) {
            setPrefCities([]);
            return;
        }

        const fetchPrefCities = async () => {
            try {
                const res = await API.get(
                    `/fetch-city?state=${encodeURIComponent(
                        formik.values.preferences.preferredState
                    )}`
                );
                setPrefCities(Array.isArray(res?.data) ? res.data : []);
            } catch (err) {
                toast.error("Failed to load cities");
            }
        };

        fetchPrefCities();
    }, [formik.values.preferences.preferredState]);

    // Helper to check if a section has errors to highlight the accordion
    const hasSectionError = (fields) => {
        return fields.some(field => {
            const error = field.split('.').reduce((obj, key) => obj?.[key], formik.errors);
            const touched = field.split('.').reduce((obj, key) => obj?.[key], formik.touched);
            return error && touched;
        });
    };

    const getId = (val) => (typeof val === "object" ? val?._id : val);

    const selectedCategory = categoryId;
    const selectedProperty = formik.values.preferences.preferredProperty;

    const filteredProperty = property.filter(
        (p) => String(getId(p.academic_type)) === String(selectedCategory)
    );

    const mappedCourses = propertyCourse.filter(
        (pc) => String(pc.property_id) === String(selectedProperty)
    );

    const courseIds = mappedCourses.map((pc) => String(pc.course_id));

    const filteredCourse = course.filter((c) =>
        courseIds.includes(String(c._id))
    );

    useEffect(() => {
        formik.setFieldValue("preferences.preferredCourse", "");
    }, [selectedProperty]);

    const schema = FORM_SCHEMA[categoryKey] || {
        basic: [],
        academics: [],
        preferences: []
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Leads", to: "/dashboard/leads/all" },
                    { label: "Add Lead" },
                ]}
                actions={[{ label: "Back", to: "/dashboard/leads/all", Icon: ArrowLeft, variant: "primary" }]}
            />

            <form onSubmit={formik.handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <Accordion
                    id="basic"
                    title={`Basic Information (${myCategory[0]?.category_name})`}
                    icon={<User size={18} />}
                    isOpen={openSection === "basic"}
                    toggle={() => setOpenSection(openSection === "basic" ? "" : "basic")}
                    hasError={hasSectionError(['name', 'email', 'contact'])}
                >
                    <SectionRenderer
                        fields={schema.basic}
                        formik={formik}
                        dynamicData={{}}
                    />
                </Accordion>

                {/* Address & Location */}
                <Accordion
                    id="location"
                    title="Address & Location"
                    icon={<MapPin size={18} />}
                    isOpen={openSection === "location"}
                    toggle={() => {
                        setOpenSection(openSection === "location" ? "" : "location");
                    }}
                    hasError={hasSectionError(['city', 'state', 'pincode'])}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
                        <Input label="Address" name="address" placeholder="Enter address" formik={formik} />
                        <Input label="Pincode" name="pincode" placeholder="Enter pincode" formik={formik} />
                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                Country
                            </label>
                            <select
                                name="country"
                                value={formik.values.country}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    formik.setFieldValue("country", value);
                                    formik.setFieldValue("state", "");
                                    formik.setFieldValue("city", "");
                                    setStates([]);
                                    setCities([]);
                                }}
                                onBlur={formik.handleBlur}
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="">Select Country</option>
                                {countries.map((c) => (
                                    <option key={c.id} value={c.country_name}>
                                        {c.country_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                State
                            </label>
                            <select
                                name="state"
                                value={formik.values.state}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    formik.setFieldValue("state", value);
                                    formik.setFieldValue("city", "");
                                    setCities([]);
                                }}
                                onBlur={formik.handleBlur}
                                disabled={!formik.values.country}
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="">Select State</option>
                                {states.map((s) => (
                                    <option key={s.id} value={s.name}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5 text-gray-700">
                                City
                            </label>
                            <select
                                name="city"
                                value={formik.values.city}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                disabled={!formik.values.state}
                                className="w-full border rounded-lg px-3 py-2"
                            >
                                <option value="">Select City</option>
                                {cities.map((c) => (
                                    <option key={c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Accordion>

                {/* Academic Details */}
                {schema.sections?.schoolInfo && (
                    <Accordion
                        id="schoolInfo"
                        title={schema.sections.schoolInfo.title}
                        icon={<GraduationCap size={18} />}
                        isOpen={openSection === "schoolInfo"}
                        toggle={() => setOpenSection(openSection === "schoolInfo" ? "" : "schoolInfo")}
                    >
                        <SectionRenderer
                            fields={schema.schoolInfo}
                            formik={formik}
                            dynamicData={{}}
                        />
                    </Accordion>
                )}

                {schema.sections?.academics && (
                    <Accordion
                        id="academics"
                        title={schema.sections.academics.title}
                        icon={<GraduationCap size={18} />}
                        isOpen={openSection === "academics"}
                        toggle={() => setOpenSection(openSection === "academics" ? "" : "academics")}
                    >
                        <SectionRenderer
                            fields={schema.academics}
                            formik={formik}
                            dynamicData={{}}
                        />
                    </Accordion>
                )}

                {/* Course & Institution Preferences */}
                {Array.isArray(schema.preferences) && schema.preferences.length > 0 && (
                    <Accordion
                        id="preferences"
                        title={schema.sections?.preferences?.title || "Preferences"}
                        icon={<Settings size={18} />}
                        isOpen={openSection === "preferences"}
                        toggle={() => {
                            setOpenSection(openSection === "preferences" ? "" : "preferences");
                        }}
                    >
                        <SectionRenderer
                            fields={schema.preferences}
                            formik={formik}
                            dynamicData={{
                                countries,
                                states: prefStates,
                                cities: prefCities,
                                properties: filteredProperty,
                                courses: filteredCourse
                            }}
                        />
                    </Accordion>
                )}

                {Array.isArray(schema.exam) && schema.exam.length > 0 && (
                    <Accordion
                        id="exam"
                        title="Exam Details"
                        icon={<Settings size={18} />}
                        isOpen={openSection === "exam"}
                        toggle={() => {
                            setOpenSection(openSection === "exam" ? "" : "exam");
                        }}
                    >
                        <SectionRenderer
                            fields={schema.exam}
                            formik={formik}
                            dynamicData={{}}
                        />
                    </Accordion>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-sm"
                    >
                        {formik.isSubmitting ? "Saving..." : "Add Lead"}
                    </button>
                </div>
            </form>
        </div>
    );
};

/* ---------------- Reusable Components ---------------- */
const Accordion = ({ title, icon, children, isOpen, toggle, hasError }) => (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${isOpen ? 'shadow-md border-blue-200' : 'bg-white'}`}>
        <button
            type="button"
            onClick={toggle}
            className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${hasError ? 'bg-red-50' : 'bg-white hover:bg-gray-50'}`}
        >
            <div className="flex items-center gap-3">
                <span className={`${hasError ? 'text-red-500' : 'text-blue-600'}`}>{icon}</span>
                <span className={`font-semibold ${hasError ? 'text-red-700' : 'text-gray-800'}`}>{title}</span>
                {hasError && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Errors</span>}
            </div>
            <ChevronDown className={`transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180' : ''}`} size={20} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="border-t bg-white">{children}</div>
        </div>
    </div>
);

const getValue = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj) ?? "";

const Input = ({ label, name, type = "text", placeholder = "", formik, disabled = false }) => {
    const error = getValue(formik.errors, name);
    const touched = getValue(formik.touched, name);

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={getValue(formik.values, name)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={disabled}
                className={`w-full border rounded-lg px-3 py-2 outline-none transition-all ${disabled
                    ? "bg-gray-100 cursor-not-allowed"
                    : "border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                    }`}
            />
            {touched && error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

const FormSelect = ({ label, name, options, formik, labelKey, valueKey }) => {
    const error = getValue(formik.errors, name);
    const touched = getValue(formik.touched, name);

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>

            <select
                name={name}
                value={getValue(formik.values, name)}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full border rounded-lg px-3 py-2 ${touched && error ? 'border-red-500' : 'border-gray-300'}`}
            >
                <option value="">Select</option>

                {options.map((opt) => {
                    const value = valueKey ? opt[valueKey] : opt;
                    const label = labelKey ? opt[labelKey] : opt;

                    return (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    );
                })}
            </select>

            {touched && error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
};

export default AddLead;