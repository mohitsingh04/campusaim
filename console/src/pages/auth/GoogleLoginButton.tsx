import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { API } from "../../contexts/API";
import { getErrorResponse } from "../../contexts/Callbacks";
import toast from "react-hot-toast";

const GoogleLoginButton = () => {
  const successMessage = async (response: CredentialResponse) => {
    try {
      if (!response.credential) {
        console.error("No credential received from Google");
        return;
      }

      const res = await API.post("/profile/google/login", {
        token: response.credential,
      });

      toast.success(res.data.message || "Login Successfully");
      window.location.reload();
    } catch (error) {
      getErrorResponse(error);
    }
  };

  const errorMessage = () => console.error("Google Login failed");
  return <GoogleLogin onSuccess={successMessage} onError={errorMessage} />;
};

export default GoogleLoginButton;
