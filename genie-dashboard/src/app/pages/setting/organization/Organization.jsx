import React, { useCallback, useEffect, useState } from "react";
import { API } from "../../../services/API";
import toast from "react-hot-toast";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../context/AuthContext";
import Select from "react-select";
import OrganizationSkeleton from "./OrganizationSkeleton";
import Button from "../../../components/ui/Button/Button";
import { useNavigate } from "react-router-dom";

export default function Organization() {
    const navigate = useNavigate();
    const { authUser } = useAuth();

    const [organization, setOrganization] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [niche, setNiche] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newNiche, setNewNiche] = useState("");

    const fetchNiche = useCallback(async () => {
        try {
            const { data } = await API.get("/niche/options");
            setNiche(data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch niche");
        }
    }, []);

    const fetchOrganization = async () => {
        try {
            const res = await API.get("/organization/me");
            setOrganization(res?.data?.data || null);
        } catch (err) {
            const status = err.response?.status;
            const errorMessage = err.response?.data?.error || "";
            if (status === 404 || errorMessage.toLowerCase().includes("not found")) setOrganization(null);
            else toast.error("Failed to fetch Organization");
        } finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (!authUser?._id) return;
        fetchOrganization();
        fetchNiche();
    }, [authUser, fetchNiche]);

    const validationSchema = Yup.object({
        organization_name: Yup.string().required("Organization name is required.").matches(/^(?!.*\s{2})[A-Za-z\s]+$/, "Only alphabets and single spaces allowed").min(2, "Minimum 2 characters"),
        website: Yup.string().nullable().matches(/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i, "Enter valid website URL")
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            organization_name: organization?.organization_name || "",
            nicheId: organization?.nicheId || "",
            website: organization?.website || "",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting }) => {
            const toastId = toast.loading("Saving...");
            try {
                const { data } = await API.put("/organization", values);
                toast.success(data?.message || "Organization saved", { id: toastId });
                setOrganization(data.data);
                navigate(0);
            } catch (error) {
                toast.error(error.response?.data?.error || "Something went wrong", { id: toastId });
            } finally { setSubmitting(false); }
        }
    });

    const isReadOnly = Boolean(organization?._id);

    const nicheOptions = [
        ...niche.map(item => ({ value: item._id, label: item.name })),
        // { value: "add_new", label: "+ Add New Niche" }
    ];

    const handleCreateNiche = async () => {
        if (!newNiche.trim()) return toast.error("Niche name required");
        const toastId = toast.loading("Creating niche...");
        try {
            const res = await API.post("/niche", { name: newNiche });
            const created = res?.data?.niche;
            if (!created?._id) throw new Error("Invalid niche response");
            toast.success("Niche created", { id: toastId });
            setShowModal(false);
            setNewNiche("");
            await fetchNiche();
            formik.setFieldValue("nicheId", created._id);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || err.message || "Failed to create niche", { id: toastId });
        }
    };

    if (!authUser || isLoading) return <OrganizationSkeleton />;

    return (
        <div className="p-6">

            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Organization Information</h2>
                <p className="mt-1 text-sm text-amber-600">Note: Once saved, organization details cannot be updated.</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    <div>
                        <label className="block text-sm font-medium mb-2">Niche</label>
                        <Select
                            name="nicheId"
                            options={nicheOptions}
                            value={nicheOptions.find(o => o.value === formik.values.nicheId) || null}
                            onChange={(option) => {
                                if (option?.value === "add_new") return setShowModal(true);
                                formik.setFieldValue("nicheId", option?.value || "");
                            }}
                            placeholder="Select niche"
                            classNamePrefix="react-select"
                            isDisabled={isReadOnly}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Organization Name</label>
                        <input
                            type="text"
                            name="organization_name"
                            placeholder="Enter organization name"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={formik.values.organization_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.organization_name && formik.errors.organization_name && (
                            <p className="text-red-500 text-sm mt-1">{formik.errors.organization_name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Website</label>
                        <input
                            type="text"
                            name="website"
                            placeholder="example.com or https://example.com"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={formik.values.website}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </div>

                </div>

                <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="md" loading={formik.isSubmitting}>Save Changes</Button>
                </div>

            </form>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-96">

                        <h3 className="text-lg font-semibold mb-4">Add New Niche</h3>

                        <input
                            type="text"
                            placeholder="Enter niche name"
                            value={newNiche}
                            onChange={e => setNewNiche(e.target.value)}
                            className="w-full border px-3 py-2 rounded-lg mb-4"
                        />

                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                            <button type="button" onClick={handleCreateNiche} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}