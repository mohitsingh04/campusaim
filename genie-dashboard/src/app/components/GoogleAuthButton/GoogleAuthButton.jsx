// components/GoogleAuthButton.jsx
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { API } from "../../services/API";

export default function GoogleAuthButton() {
    const navigate = useNavigate();

    const handleSuccess = async (response) => {
        const toastId = toast.loading("Signing in with Google...");

        try {
            const { data } = await API.post(
                "/auth/google",
                { credential: response.credential },
                { withCredentials: true }
            );

            toast.success(`Welcome ${data.user.name}`, { id: toastId });
            navigate("/dashboard");
            navigate(0);
        } catch (error) {
            toast.error(
                error.response?.data?.error || "Google authentication failed",
                { id: toastId }
            );
        }
    };

    return (
        <div className="w-full flex justify-center mt-4">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => toast.error("Google Sign-In Failed")}
                useOneTap={false}
            />
        </div>
    );
}