import { useNavigate } from "react-router-dom";

export default function OrganizationRequired() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center max-w-md">
                <h1 className="text-2xl font-semibold mb-2">
                    Setup Your Organization
                </h1>

                <p className="text-gray-500 mb-6">
                    You need to create or join an organization before accessing the system.
                </p>

                <button
                    onClick={() => navigate("/dashboard/settings")}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Add Organization
                </button>
            </div>
        </div>
    );
}