import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    const handleRedirect = () => {
        navigate('/dashboard');
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center px-4">
            <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-gray-500 mb-6">
                Sorry, the page you are looking for does not exist or has been moved.
            </p>
            <button
                onClick={handleRedirect}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
                Go to Dashboard
            </button>
        </div>
    );
};

export default NotFound;
