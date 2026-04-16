import React, { useCallback, useMemo, useState, useEffect } from "react";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../services/API";
import { toast } from 'react-hot-toast';

const initialState = {
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const sanitizeText = (value) => value.replace(/<[^>]*>?/gm, "").trim();

export default function Support() {
    const { authUser } = useAuth();

    const [form, setForm] = useState(initialState);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    /* ---------------- AUTO FILL ---------------- */
    useEffect(() => {
        if (!authUser) return;

        setForm(prev => ({
            ...prev,
            name: prev.name || authUser?.name || "",
            email: prev.email || authUser?.email || "",
        }));
    }, [authUser]);

    const categories = useMemo(() => [
        { label: "General Query", value: "general" },
        { label: "Technical Issue", value: "technical" },
        { label: "Billing", value: "billing" },
        { label: "Account / Login", value: "account" },
        { label: "Feature Request", value: "feature" },
    ], []);

    const validate = useCallback(() => {
        const next = {};
        if (!form.name || form.name.trim().length < 2)
            next.name = "Name must be at least 2 characters";

        if (!EMAIL_REGEX.test(form.email))
            next.email = "Enter a valid email address";

        if (!form.subject || form.subject.trim().length < 3)
            next.subject = "Subject must be at least 3 characters";

        if (!form.message || form.message.trim().length < 10)
            next.message = "Message must be at least 10 characters";

        return next;
    }, [form]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: undefined }));
        setSuccess("");
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        setSuccess("");

        const validationErrors = validate();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            name: sanitizeText(form.name),
            email: sanitizeText(form.email),
            category: form.category,
            subject: sanitizeText(form.subject),
            message: sanitizeText(form.message),
        };

        try {
            setLoading(true);
            const res = await API.post("/support", payload);
            toast.success(res?.data?.message);
            setSuccess("Your request has been submitted. Our team will get back to you shortly.");
            setForm(initialState);
        } catch (err) {
            setErrors(prev => ({
                ...prev,
                api: err.message || "Something went wrong. Please try again.",
            }));
        } finally {
            setLoading(false);
        }
    }, [form, validate]);

    return (
        <div className="space-y-6">
            <Breadcrumbs
                items={[
                    { label: "Dashboard", to: "/dashboard" },
                    { label: "Support" },
                ]}
            />

            <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">Contact Support</h2>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border rounded p-2 disabled:cursor-not-allowed"
                            disabled
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border rounded p-2 disabled:cursor-not-allowed"
                            disabled
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Category</label>
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        >
                            {categories.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Subject</label>
                        <input
                            name="subject"
                            value={form.subject}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium">Message</label>
                        <textarea
                            name="message"
                            rows="4"
                            value={form.message}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
                    </div>

                    {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
                    {errors.api && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{errors.api}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}