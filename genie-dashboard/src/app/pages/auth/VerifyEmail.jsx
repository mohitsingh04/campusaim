import React, { useEffect, useState } from "react";
import { API } from "../../services/API";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const RESEND_COOLDOWN = 30;
const STORAGE_KEY = "verifyEmailCooldownEnd";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();

    const [remaining, setRemaining] = useState(null);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isVerified, setIsVerified] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get("email");

    /* ⏱️ Cooldown */
    useEffect(() => {
        if (!email) return;

        let endTime = localStorage.getItem(STORAGE_KEY);

        if (endTime) {
            endTime = Number(endTime);
        } else {
            endTime = Date.now() + RESEND_COOLDOWN * 1000;
            localStorage.setItem(STORAGE_KEY, endTime);
        }

        const updateTimer = () => {
            const secondsLeft = Math.max(
                0,
                Math.ceil((endTime - Date.now()) / 1000)
            );

            setRemaining(secondsLeft);

            if (secondsLeft === 0) {
                setCanResend(true);
                localStorage.removeItem(STORAGE_KEY);
                return false;
            }
            return true;
        };

        updateTimer();
        const interval = setInterval(() => {
            if (!updateTimer()) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [email]);

    /* 🔍 Check verification status (SAFE) */
    useEffect(() => {
        if (!email) return;

        const checkStatus = async () => {
            try {
                const res = await API.get(
                    `/check-verification?email=${encodeURIComponent(email)}`
                );

                if (res.data?.isVerified === true) {
                    setIsVerified(true);
                }
            } catch (err) {
                console.error(err);
            }
        };

        checkStatus();
    }, [email]);

    /* 🔁 Redirect when verified */
    useEffect(() => {
        if (isVerified) {
            navigate("/");
        }
    }, [isVerified, navigate]);

    const handleResend = async () => {
        if (!email || loading) return;

        try {
            setLoading(true);
            setMessage("");

            await API.post("/resend-verification-email", { email });

            setMessage("Verification email resent successfully.");

            const newEndTime = Date.now() + RESEND_COOLDOWN * 1000;
            localStorage.setItem(STORAGE_KEY, newEndTime);

            setRemaining(RESEND_COOLDOWN);
            setCanResend(false);
        } catch (err) {
            toast.error(
                err.response?.data?.error ||
                "Failed to resend verification email."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                <h1 className="text-2xl font-semibold mb-3">Verify your email</h1>

                <p className="text-gray-600 mb-4">
                    We’ve sent a verification link to:
                </p>

                <p className="font-medium text-gray-800 mb-6">{email}</p>

                <p className="text-sm text-gray-500 mb-6">
                    Please check your inbox and click the link to activate your account.
                </p>

                {!canResend && remaining !== null ? (
                    <p className="text-sm text-gray-400 mb-4">
                        You can resend the email in{" "}
                        <span className="font-semibold">{remaining}s</span>
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition"
                    >
                        {loading ? "Sending..." : "Resend verification email"}
                    </button>
                )}

                {message && (
                    <p className="text-sm mt-4 text-gray-700">{message}</p>
                )}
            </div>
        </div>
    );
}
