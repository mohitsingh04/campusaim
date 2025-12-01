import { useCallback, useEffect,  useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { API } from "../../contexts/API";
import { AxiosError } from "axios";
import { getErrorResponse } from "../../contexts/Callbacks";
import { UserProps } from "../../types/types";

export default function DeleteAccountConfrim() {
  const navigator = useNavigate();
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<UserProps | null>(null);

  // ✅ get profile first
  const getProfile = useCallback(async () => {
    try {
      const response = await API.get(`/profile/detail`);
      setProfile(response.data);
    } catch (error) {
      getErrorResponse(error, true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || !profile?.uniqueId) return;

      try {
        const response = await API.get(
          `/profile/delete/account/${profile.uniqueId}/${token}`
        );

        if (response.data?.message) {
          setVerified(true);
          Swal.fire({
            title: "Email Verified!",
            text: response.data.message,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => navigator("/"));
        } else {
          throw new Error(response.data?.error || "Invalid token.");
        }
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        setError(err?.response?.data?.error || "Something went wrong.");
        Swal.fire({
          title: "Verification Failed!",
          text: err?.response?.data?.error || "Something went wrong.",
          icon: "error",
          confirmButtonText: "OK",
        }).then(() => {
          setTimeout(() => navigator("/"), 5000);
        });
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, profile, navigator]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-xl w-full text-center p-8">
        {loading ? (
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200">
            Deleting...
          </h3>
        ) : verified ? (
          <h1 className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
            Your Account has been deleted Successfully!
          </h1>
        ) : (
          <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-md">
            <h1 className="text-lg md:text-xl font-semibold">
              {error || "Invalid or Expired Token!"}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
