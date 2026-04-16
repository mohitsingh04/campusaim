// React 18+, JavaScript
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { useAuth } from "../../context/AuthContext";
import { API } from "../../services/API";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const sanitizeText = (v) => v.replace(/<[^>]*>?/gm, "").trim();

export default function EditSupport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [support, setSupport] = useState(null);

  /* ================= CATEGORY ================= */
  const categories = useMemo(() => [
    { label: "General Query", value: "general" },
    { label: "Technical Issue", value: "technical" },
    { label: "Billing", value: "billing" },
    { label: "Account / Login", value: "account" },
    { label: "Feature Request", value: "feature" },
  ], []);

  /* ================= FETCH ================= */
  const fetchSupport = useCallback(async () => {
    try {
      setLoading(true);

      const { data } = await API.get(`/support/${id}`);
      const ticket = data?.data;

      if (!ticket) throw new Error("Support not found");

      // 🔒 Ownership + status check (UI level)
      const isOwner = ticket?.createdBy?.toString() === authUser?._id?.toString();

      if (!isOwner) {
        toast.error("Unauthorized");
        return navigate("/dashboard/my-support");
      }

      if (ticket.status !== "open") {
        toast.error("Only open tickets can be edited");
        return navigate(`/dashboard/support/view/${id}`);
      }

      setSupport(ticket);

      setForm({
        name: ticket.name || "",
        email: ticket.email || "",
        category: ticket.category || "general",
        subject: ticket.subject || "",
        message: ticket.message || ""
      });

    } catch (err) {
      console.error(err);
      toast.error("Failed to load support");
      navigate("/dashboard/my-support");
    } finally {
      setLoading(false);
    }
  }, [id, authUser, navigate]);

  useEffect(() => {
    if (id && authUser) fetchSupport();
  }, [id, authUser, fetchSupport]);

  /* ================= VALIDATE ================= */
  const validate = () => {
    const next = {};

    if (!form.subject || form.subject.trim().length < 3)
      next.subject = "Subject must be at least 3 characters";

    if (!form.message || form.message.trim().length < 10)
      next.message = "Message must be at least 10 characters";

    return next;
  };

  /* ================= CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        category: form.category,
        subject: sanitizeText(form.subject),
        message: sanitizeText(form.message)
      };

      await API.put(`/support/${id}`, payload);

      toast.success("Support updated successfully");
      navigate(`/dashboard/support/view/${id}`);

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">

      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "My Support", to: "/dashboard/my-support" },
          { label: "Edit", active: true }
        ]}
        actions={[
          {
            label: "Back",
            to: `/dashboard/support/view/${id}`,
            Icon: ArrowLeft,
            variant: "primary"
          }
        ]}
      />

      <div className="bg-white shadow rounded-lg p-6 max-w-full">
        <h2 className="text-xl font-semibold mb-4">Edit Support Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              value={form.name}
              disabled
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              value={form.email}
              disabled
              className="w-full border rounded p-2 bg-gray-100"
            />
          </div>

          {/* CATEGORY */}
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

          {/* SUBJECT */}
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

          {/* MESSAGE */}
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

          {/* ACTION */}
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Ticket"}
          </button>

        </form>
      </div>

    </div>
  );
}