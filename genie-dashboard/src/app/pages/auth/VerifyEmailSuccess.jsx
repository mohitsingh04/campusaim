import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API } from "../../services/API";

export default function VerifyEmailSuccess() {
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get("token");
    const hasRequestedRef = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Invalid verification link.");
            return;
        }

        if (hasRequestedRef.current) return;
        hasRequestedRef.current = true;

        const verifyEmail = async () => {
            try {
                const res = await API.get(
                    `/verify-email?token=${token}`
                );

                setStatus("success");
                setMessage(res.data.message || "Email verified successfully.");

                setTimeout(() => {
                    navigate("/");
                }, 2500);
            } catch (err) {
                setStatus("error");
                setMessage(
                    err.response?.data?.error ||
                    "Verification link expired or invalid."
                );
            }
        };

        verifyEmail();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
                {status === "loading" && (
                    <p className="text-gray-600">Verifying your email...</p>
                )}

                {status === "success" && (
                    <>
                        <h2 className="text-2xl font-semibold text-green-600 mb-2">
                            Email Verified 🎉
                        </h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-sm text-gray-400 mt-3">
                            Redirecting to login...
                        </p>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h2 className="text-2xl font-semibold text-red-600 mb-2">
                            Verification Failed
                        </h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                )}
            </div>
        </div>
    );
}
