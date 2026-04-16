import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { API } from '../../services/API';
import toast from 'react-hot-toast';
import InputMask from 'react-input-mask';
import Breadcrumbs from '../../components/ui/BreadCrumb/Breadcrumbs';
import { ArrowLeft } from 'lucide-react';
import EditLeadSkeleton from './Skeleton/EditLeadSkeleton';

const EditLead = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const { data } = await API.get(`/leads/${id}`);
                setLead(data);
            } catch {
                toast.error('Failed to fetch lead data');
            } finally {
                setIsLoading(false);
            }
        })();
    }, [id]);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Name is required.')
            .matches(/^(?!.*\s{2})[A-Za-z\s]+$/, 'Only alphabets & single spaces allowed.')
            .min(2, 'Min 2 characters'),
        email: Yup.string().email('Invalid email').required('Email is required.'),
        contact: Yup.string()
            .required('Contact number is required.')
            .transform((v) => v.replace(/\s/g, ''))
            .matches(/^(\+91|0)?[6-9][0-9]{9}$/, 'Invalid Indian contact'),
        city: Yup.string().max(80),
        state: Yup.string().max(80),
        pincode: Yup.string().matches(/^\d{6}$/, 'Invalid pincode').nullable(),
        'academics.passingYear': Yup.number().min(1980).max(new Date().getFullYear() + 1).nullable(),
        'academics.percentage': Yup.number().min(0).max(100).nullable(),
    });

    const initialValues = {
        name: lead?.name || '',
        contact: lead?.contact || '',
        email: lead?.email || '',
        address: lead?.address || '',
        city: lead?.city || '',
        state: lead?.state || '',
        pincode: lead?.pincode || '',
        applicationDoneBy: lead?.applicationDoneBy || "",

        academics: {
            qualification: lead?.academics?.qualification || '',
            boardOrUniversity: lead?.academics?.boardOrUniversity || '',
            passingYear: lead?.academics?.passingYear || '',
            percentage: lead?.academics?.percentage || '',
            stream: lead?.academics?.stream || '',
        },

        preferences: {
            courseName: lead?.preferences?.courseName || '',
            courseType: lead?.preferences?.courseType || '',
            specialization: lead?.preferences?.specialization || '',
            preferredState: lead?.preferences?.preferredState || '',
            preferredCity: lead?.preferences?.preferredCity || '',
            collegeType: lead?.preferences?.collegeType || 'Any',
        },
    };

    const handleSubmit = async (values) => {
        try {

            const payload = {
                ...values,
                contact: values.contact.replace(/\s/g, ""),
            };

            const { data } = await API.put(`/leads/${id}`, payload);

            toast.success(data?.message || "Updated Successfully.");
            navigate("/dashboard/leads/all");

        } catch (err) {
            toast.error(err?.response?.data?.error || "Something went wrong!");
        }
    };

    const formik = useFormik({
        initialValues,
        validationSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true,
    });

    if (isLoading) return <EditLeadSkeleton />;

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: 'Dashboard', to: '/dashboard' },
                    { label: 'Leads', to: '/dashboard/leads/all' },
                    { label: 'Lead Edit' },
                ]}
                actions={[
                    {
                        label: 'Back',
                        to: '/dashboard/leads/all',
                        Icon: ArrowLeft,
                        variant: 'primary',
                    },
                ]}
            />

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <form onSubmit={formik.handleSubmit}>
                    <h2 className="text-lg font-semibold mb-6">Edit Lead</h2>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Name" name="name" formik={formik} />
                        <Input label="Email" name="email" type="email" formik={formik} />

                        {/* Contact */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Contact Number</label>
                            <InputMask
                                mask="99999 99999"
                                maskChar=""
                                name="contact"
                                value={formik.values.contact}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            >
                                {(props) => (
                                    <input
                                        {...props}
                                        className="w-full border rounded-lg px-3 py-2 border-gray-300"
                                    />
                                )}
                            </InputMask>
                            {formik.touched.contact && formik.errors.contact && (
                                <p className="text-red-500 text-sm mt-1">{formik.errors.contact}</p>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <Section title="Address & Location">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Address" name="address" formik={formik} />
                            <Input label="City" name="city" formik={formik} />
                            <Input label="State" name="state" formik={formik} />
                            <Input label="Pincode" name="pincode" formik={formik} />
                        </div>
                    </Section>

                    {/* Academic Details */}
                    <Section title="Academic Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Qualification" name="academics.qualification" formik={formik} />
                            <Input label="Board / University" name="academics.boardOrUniversity" formik={formik} />
                            <Input label="Passing Year" name="academics.passingYear" type="number" formik={formik} />
                            <Input label="Percentage" name="academics.percentage" type="number" formik={formik} />
                            <Input label="Stream" name="academics.stream" formik={formik} />
                        </div>
                    </Section>

                    {/* Course Preferences */}
                    <Section title="Course Preferences">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Course Name" name="preferences.courseName" formik={formik} />
                            <FormSelect
                                label="Course Type"
                                name="preferences.courseType"
                                formik={formik}
                                options={['UG', 'PG', 'Diploma', 'Certificate', 'PhD', 'Other']}
                            />
                            <Input label="Specialization" name="preferences.specialization" formik={formik} />
                            <Input label="Preferred State" name="preferences.preferredState" formik={formik} />
                            <Input label="Preferred City" name="preferences.preferredCity" formik={formik} />
                            <FormSelect
                                label="College Type"
                                name="preferences.collegeType"
                                formik={formik}
                                options={['Government', 'Private', 'Deemed', 'Autonomous', 'Any']}
                            />
                        </div>
                    </Section>

                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={formik.isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                            {formik.isSubmitting ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ---------------- Reusable Components ---------------- */

const getValue = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj) || '';

const Input = ({ label, name, type = 'text', formik }) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <input
            type={type}
            name={name}
            value={getValue(formik.values, name)}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded-lg px-3 py-2 border-gray-300"
        />
        {getValue(formik.touched, name) && getValue(formik.errors, name) && (
            <p className="text-red-500 text-sm mt-1">{getValue(formik.errors, name)}</p>
        )}
    </div>
);

const FormSelect = ({ label, name, options, formik }) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>

        <select
            name={name}
            value={getValue(formik.values, name)}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded-lg px-3 py-2 border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
            <option value="">Select</option>

            {options.map((opt) =>
                typeof opt === "object" ? (
                    <option key={opt.value} value={opt.value}>
                        {opt.label.length > 60 ? opt.label.slice(0, 60) + "..." : opt.label}
                    </option>
                ) : (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                )
            )}
        </select>

        {getValue(formik.touched, name) && getValue(formik.errors, name) && (
            <p className="text-red-500 text-sm mt-1">{getValue(formik.errors, name)}</p>
        )}
    </div>
);

const Section = ({ title, children }) => (
    <div className="mt-8">
        <h3 className="text-md font-semibold mb-3 text-gray-800">{title}</h3>
        {children}
    </div>
);

export default EditLead;