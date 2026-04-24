import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from './app/components/errorBoundary/ErrorBoundary.jsx';
import { initGlobalErrorHandler } from './app/utils/globalErrorHandler.js';
import { AuthProvider } from './app/context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  console.error("SECURITY/CONFIG RISK: VITE_GOOGLE_CLIENT_ID is missing.");
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

initGlobalErrorHandler();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
          <ErrorBoundary>
            <App />
            <Toaster />
          </ErrorBoundary>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);