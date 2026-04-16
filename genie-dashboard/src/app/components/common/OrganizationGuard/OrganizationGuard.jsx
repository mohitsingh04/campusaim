import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const ORGANIZATION_SETTINGS_URL = "/dashboard/settings?tab=organization";

export default function OrganizationGuard({ children }) {
    const navigate = useNavigate();
    const { authUser } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        try {
            // Wait until authUser is resolved (avoid premature modal flash)
            if (authUser === undefined) return;

            if (!authUser) {
                setIsChecking(false);
                return; // not logged in → guard should not run here
            }

            // typo-safe fallback
            const organizationId =
                authUser.organizationId || authUser.organzationId || null;

            if (!organizationId) {
                setShowModal(true);
            }
        } catch (error) {
            console.error("Organization validation error:", error);
        } finally {
            setIsChecking(false);
        }
    }, [authUser]);

    const handleRedirect = () => {
        try {
            setShowModal(false);
            navigate(ORGANIZATION_SETTINGS_URL, { replace: true });
        } catch (error) {
            console.error("Navigation error:", error);
        }
    };

    if (isChecking) return null;

    return (
        <>
            {children}

            {/* Tailwind Custom Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl animate-fadeIn">
                        {/* Header */}
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold text-gray-800">
                                Organization Required
                            </h2>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                You don’t have an organization configured yet. Please add your
                                organization details to continue using the dashboard features.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 px-6 py-4 border-t">
                            <button
                                type="button"
                                onClick={handleRedirect}
                                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
                            >
                                Go to Organization Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
