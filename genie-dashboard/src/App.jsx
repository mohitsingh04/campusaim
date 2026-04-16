import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'react-loading-skeleton/dist/skeleton.css';
import "sweetalert2/dist/sweetalert2.min.css";

import ProtectedRoute from './app/routes/ProtectedRoute';
import GuestRoute from './app/routes/GuestRoute';
import DashboardRoutes from './app/routes/DashboardRoutes';
import NotFound from './app/components/common/pages/404NotFound';

import { AuthProvider } from './app/context/AuthContext';
import DashboardLayout from './app/layout/DashboardLayout';
import { API } from './app/services/API';
import Loader from './app/common/Loader/Loader';
import ScrollToTop from './app/components/common/ScrollToTop/ScrollToTop';
import InviterPartner from './app/pages/auth/InviterPartner';
import Apply from './app/pages/test/Apply';
import Ref from './app/pages/test/Ref';
import BecomeAPartner from './app/pages/auth/BecomeAPartner';

// Auth Pages
const LoginForm = lazy(() => import('../src/app/pages/auth/LoginForm'));
const RegisterForm = lazy(() => import('../src/app/pages/auth/RegisterForm'));
const ForgotPasswordForm = lazy(() => import('../src/app/pages/auth/ForgotPasswordForm'));
const VerifyOtp = lazy(() => import('../src/app/pages/auth/VerifyOtp'));
const VerifyEmail = lazy(() => import('../src/app/pages/auth/VerifyEmail'));
const VerifyEmailSuccess = lazy(() => import('../src/app/pages/auth/VerifyEmailSuccess'));
const ResetPassword = lazy(() => import('../src/app/pages/auth/ResetPassword'));

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAuthUserData = async () => {
      try {
        const { data } = await API.get("/profile");
        setAuthUser(data?.data);
      } catch (error) {
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };
    getAuthUserData();
  }, []);

  if (loading) return <Loader />;

  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Loader />}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<GuestRoute><LoginForm /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterForm /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordForm /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            <Route path="/verify-otp" element={<GuestRoute><VerifyOtp /></GuestRoute>} />
            <Route path="/verify-email" element={<GuestRoute><VerifyEmail /></GuestRoute>} />
            <Route path="/verify-email/success" element={<GuestRoute><VerifyEmailSuccess /></GuestRoute>} />
            <Route path="/partner/register/:token" element={<GuestRoute><InviterPartner /></GuestRoute>} />
            <Route path="/ref" element={<GuestRoute><Ref /></GuestRoute>} />
            <Route path="/apply" element={<GuestRoute><Apply /></GuestRoute>} />
            <Route path="/become-a-partner" element={<GuestRoute><BecomeAPartner /></GuestRoute>} />

            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute authUser={authUser}>
                  <DashboardLayout>
                    <DashboardRoutes role={authUser?.role} />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;