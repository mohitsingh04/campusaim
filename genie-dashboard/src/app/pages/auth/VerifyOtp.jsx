import React, { useState, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { API } from '../../services/API';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();

    const [allUsers, setAllUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(30);

    // Get email from query params
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');

    // Fetch all users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get('/user');
                setAllUsers(res.data);
            } catch (error) {
                toast.error(error.message || 'Failed to load users');
            }
        };
        fetchUsers();
    }, []);

    // Find the current user based on email
    const currentUser = useMemo(
        () => allUsers.find((user) => user?.email === email),
        [allUsers, email]
    );

    // Redirect if no email or already verified
    useEffect(() => {
        if (!email || currentUser?.isVerified) {
            navigate('/');
        }
    }, [email, currentUser, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            email,
            otp: ['', '', '', '', '', ''],
        },
        validationSchema: Yup.object({
            otp: Yup.array()
                .of(Yup.string().matches(/^[0-9]$/, 'Must be a number').required('Required'))
                .length(6, 'OTP must be 6 digits'),
        }),
        onSubmit: async (values) => {
            const otpCode = values.otp.join('');
            const toastId = toast.loading('Verifying...');

            try {
                const res = await API.post('/verify-email', {
                    email: values.email,
                    otp: otpCode,
                });

                toast.success(res.data.message || 'OTP verified successfully', { id: toastId });
                navigate('/');
            } catch (error) {
                const msg = error.response?.data?.error || 'Verification failed';
                setErrorMessage(msg);
                toast.error(msg, { id: toastId });
            }
        },
    });

    // OTP input change handler
    const handleOtpChange = (e, index) => {
        const value = e.target.value.replace(/\D/, '');
        const updatedOtp = [...formik.values.otp];
        updatedOtp[index] = value;
        formik.setFieldValue('otp', updatedOtp);

        // Auto-focus next
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }

        // Auto-submit if all filled
        if (updatedOtp.every((digit) => digit !== '')) {
            setTimeout(() => formik.handleSubmit(), 200);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setIsResending(true);
        const toastId = toast.loading('Resending OTP...');
        try {
            const res = await API.post('/resend-email', { email });
            toast.success(res.data.message || 'OTP resent', { id: toastId });
            setCountdown(60);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to resend OTP', { id: toastId });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-4">Verify OTP</h2>
                <p className="text-gray-600 text-center mb-6">
                    Enter the 6-digit code sent to your email
                </p>

                {errorMessage && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <span className="text-sm text-red-700">{errorMessage}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="flex justify-between space-x-2">
                        {formik.values.otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                name={`otp-${index}`}
                                type="text"
                                value={digit}
                                onChange={(e) => handleOtpChange(e, index)}
                                maxLength="1"
                                className="w-12 h-12 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl"
                            />
                        ))}
                    </div>

                    {typeof formik.errors.otp === 'string' && (
                        <p className="text-red-500 text-sm text-center">{formik.errors.otp}</p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
                    >
                        Verify
                    </button>
                </form>

                <div className="text-center mt-4">
                    {countdown > 0 ? (
                        <p className="text-sm text-gray-600">
                            Resend OTP in <span className="font-semibold">{countdown}s</span>
                        </p>
                    ) : (
                        <button
                            onClick={handleResendOtp}
                            disabled={isResending}
                            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                        >
                            {isResending ? 'Sending...' : 'Resend OTP'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VerifyOtp;
