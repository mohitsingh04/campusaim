import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { API } from "../../contexts/API";
import { getErrorResponse } from "../../contexts/Callbacks";
import toast from "react-hot-toast";
import { useTheme } from "../../hooks/useTheme";

export default function DeleteAccountSwal() {
  const { email } = useParams();
  const [isRunning, setIsRunning] = useState(true);
  const [timer, setTimer] = useState(60);
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  const getUser = useCallback(async () => {
    try {
      const response = await API.get(`/profile/user/email/${email}`);
      setUser(response.data || null);
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, [email]);

  useEffect(() => {
    if (!user) return;
    if (user?.deleted) {
      navigate("/register");
    }
  }, [user, navigate]);

  useEffect(() => {
    getUser();
  }, [getUser]);

  // Timer countdown
  useEffect(() => {
    if (!isRunning || timer <= 0) return setIsRunning(false);

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timer]);

  // Resend delete account email
  const handleResendDeleteMail = async () => {
    try {
      const response = await API.post(
        `/profile/delete/account/${user?.uniqueId}`
      );
      toast.success(
        response.data?.message ||
          "A delete account confirmation email has been resent."
      );

      setTimer(60);
      setIsRunning(true);
    } catch (error) {
      getErrorResponse(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="flex flex-col items-center space-y-12 w-full max-w-4xl">
        {/* Logo */}
        <div className="mb-8 flex justify-center md:justify-start w-full md:w-1/3">
          {theme === "dark" ? (
            <img
              src="/img/logo/logo-white-new.png"
              alt="Logo White"
              className="w-auto h-12"
            />
          ) : (
            <img
              src="/img/logo/logo-black-new.png"
              alt="Logo Black"
              className="h-12 w-auto"
            />
          )}
        </div>

        {/* Card */}
        <div className="w-full md:w-2/3">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-50 rounded-lg shadow-md p-8">
            <div className="text-center">
              <h4 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Confirm Account Deletion
              </h4>
              <p className="mb-6 text-gray-700 dark:text-gray-300">
                A confirmation email has been sent to your registered email
                address. Please confirm to permanently delete your account. This
                link will expire in 24 hours.
              </p>

              {isRunning ? (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  You can resend the delete confirmation email in{" "}
                  <span className="text-red-500">{timer} sec</span>.
                </p>
              ) : (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Didn’t receive the email?{" "}
                  <span
                    className="text-blue-500 cursor-pointer hover:underline"
                    onClick={handleResendDeleteMail}
                  >
                    Click here to resend
                  </span>
                </p>
              )}

              <Link
                className="text-blue-500 mt-2 inline-block hover:underline"
                to="/"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
