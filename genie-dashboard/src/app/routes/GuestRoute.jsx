import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API } from "../services/API";

const GuestRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await API.get("/profile");
                setUser(res.data);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) return null;
    return user ? <Navigate to="/dashboard" /> : children;
};

export default GuestRoute;