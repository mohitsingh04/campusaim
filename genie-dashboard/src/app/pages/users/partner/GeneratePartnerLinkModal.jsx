import React, { useState, useEffect } from "react";
import { Copy, Link as LinkIcon, X, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { CampusaimAPI } from "../../../services/API";

export default function GeneratePartnerLinkModal({ open, onClose }) {
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [inviteLink, setInviteLink] = useState("");
    const [expiresAt, setExpiresAt] = useState(null);

    useEffect(() => {
        if (!open) return;

        const fetchExistingInvite = async () => {
            try {
                setChecking(true);

                const { data } = await CampusaimAPI.get("/invites/partner");

                if (data?.inviteLink) {
                    setInviteLink(data.inviteLink);
                    setExpiresAt(data.expiresAt);
                } else {
                    setInviteLink("");
                    setExpiresAt(null);
                }
            } catch (err) {
                console.error("Fetch invite error:", err);
            } finally {
                setChecking(false);
            }
        };

        fetchExistingInvite();
    }, [open]);

    const handleGenerateLink = async () => {
        try {
            setLoading(true);

            const { data } = await CampusaimAPI.post("/invites/partner");

            if (!data?.inviteLink) throw new Error("Invalid response");

            setInviteLink(data.inviteLink);
            setExpiresAt(data.expiresAt);

            toast.success("Invite link generated");
        } catch (err) {
            console.error("Generate link error:", err);

            toast.error(
                err.response?.data?.error || "Failed to generate invite link"
            );
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            toast.success("Link copied");
        } catch {
            toast.error("Copy failed");
        }
    };

    // format expiry date
    const formatExpiry = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleString();
    };

    // calculate time remaining
    const getRemainingTime = (date) => {
        if (!date) return "";

        const diff = new Date(date) - new Date();

        if (diff <= 0) return "Expired";

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day(s) remaining`;

        return `${hours} hour(s) remaining`;
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative animate-fadeIn">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <LinkIcon className="w-5 h-5 text-blue-600" />
                    Generate Partner Invite Link
                </h2>

                <p className="text-sm text-gray-500 mb-6">
                    Create a secure registration link for partners.
                </p>

                {checking && (
                    <p className="text-sm text-gray-500 mb-4">
                        Checking existing invite...
                    </p>
                )}

                {!inviteLink && !checking && (
                    <button
                        onClick={handleGenerateLink}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Generating..." : "Generate Invite Link"}
                    </button>
                )}

                {inviteLink && (
                    <>
                        <div className="mt-4 flex items-center gap-2 bg-gray-50 border rounded-lg p-2">
                            <input
                                type="text"
                                value={inviteLink}
                                readOnly
                                className="flex-1 bg-transparent text-sm outline-none"
                            />

                            <button
                                onClick={copyToClipboard}
                                className="p-2 text-gray-600 hover:text-blue-600"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>

                        {expiresAt && (
                            <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                <Clock className="w-4 h-4" />
                                <span>
                                    Expires: {formatExpiry(expiresAt)}
                                </span>
                                <span className="text-gray-400">
                                    ({getRemainingTime(expiresAt)})
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}