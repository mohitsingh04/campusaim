import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, authUser }) => {
    if (!authUser) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;