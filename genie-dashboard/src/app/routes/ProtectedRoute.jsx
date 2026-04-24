import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, authUser }) => {
    if (!authUser) return <Navigate to="/" replace />;

    if (!authUser?.appRole) {
        console.error("Missing appRole");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;