// React 18+, JavaScript
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, User, Mail, Tag, FileText, MessageSquare, Clock, CheckCircle2
} from "lucide-react";

import Breadcrumbs from "../../components/ui/BreadCrumb/Breadcrumbs";
import { API } from "../../services/API";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

/* ================= CONSTANTS ================= */
const STATUS_MAP = {
  open: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-700"
};

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed"
};

export default function ViewSupport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [support, setSupport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  /* ================= ROLE CHECK ================= */
  const isAdmin = ["superadmin"].includes(authUser?.role || "");
  const isOwner = support?.createdBy?.toString() === authUser?._id?.toString();

  /* ================= FETCH ================= */
  const fetchSupport = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/support/${id}`);
      setSupport(data?.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch support details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchSupport();
  }, [id, fetchSupport]);

  /* ================= STATUS UPDATE ================= */
  const updateStatus = async (status) => {
    try {

      // 🔒 Frontend guard (UX only)
      if (!isAdmin) {
        if (!isOwner) {
          return toast.error("Unauthorized");
        }
        if (!["open", "closed"].includes(status)) {
          return toast.error("Not allowed");
        }
      }

      setUpdating(true);

      await API.put(`/support/status/${id}`, { status });

      setSupport(prev => ({ ...prev, status }));
      toast.success("Status updated");

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const supportListPath = ["superadmin"].includes(authUser?.role)
    ? "/dashboard/support"
    : "/dashboard/my-support";

  /* ================= LOADING ================= */
  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!support) {
    return <div className="p-6 text-center text-red-500">Support not found</div>;
  }

  return (
    <div className="space-y-6">

      <Breadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Support", to: supportListPath },
          { label: "View", active: true }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded shadow">
        <div>
          <h2 className="text-lg font-semibold">Support Ticket</h2>
          <p className="text-sm text-gray-500">ID: {support._id}</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded hover:bg-gray-200"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Details */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Left */}
        <div className="bg-white p-6 rounded shadow space-y-4">

          <div className="flex items-center gap-2">
            <User size={16} />
            <span className="font-medium">{support.name}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={16} />
            {support.email}
          </div>

          <div className="flex items-center gap-2">
            <Tag size={16} />
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              {support.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span className="text-sm">
              {new Date(support.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_MAP[support.status]}`}>
              {STATUS_LABELS[support.status]}
            </span>
          </div>

        </div>

        {/* Right */}
        <div className="bg-white p-6 rounded shadow space-y-4">

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} />
              <h3 className="font-medium">Subject</h3>
            </div>
            <p className="text-gray-700">{support.subject}</p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} />
              <h3 className="font-medium">Message</h3>
            </div>
            <p className="text-gray-700 whitespace-pre-line">
              {support.message}
            </p>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-6 rounded shadow">
        <h3 className="font-medium mb-3">Actions</h3>

        <div className="flex flex-wrap gap-2">

          {/* ===== ADMIN ===== */}
          {isAdmin && (
            Object.keys(STATUS_LABELS).map(status => (
              <button
                key={status}
                disabled={updating || support.status === status}
                onClick={() => updateStatus(status)}
                className={`px-3 py-2 rounded text-sm border ${support.status === status
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-white hover:bg-gray-100"
                  }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))
          )}

          {/* ===== OWNER ===== */}
          {!isAdmin && isOwner && (
            <>
              {/* EDIT */}
              {support.status === "open" && (
                <button
                  onClick={() => navigate(`/dashboard/support/edit/${support._id}`)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit Ticket
                </button>
              )}

              {/* CLOSE */}
              {["open", "in_progress"].includes(support.status) && (
                <button
                  onClick={() => updateStatus("closed")}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Close Ticket
                </button>
              )}

              {/* REOPEN */}
              {support.status === "closed" && (
                <button
                  onClick={() => updateStatus("open")}
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Reopen Ticket
                </button>
              )}
            </>
          )}

        </div>
      </div>

    </div>
  );
}