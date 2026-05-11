import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RefreshCcw } from "lucide-react";

/**
 * ProtectedRoute - Wrapper for routes that require authentication
 * If user is not logged in, redirects to login page
 * Shows loading screen while auth state is being determined
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  console.log("ProtectedRoute: isAuthenticated =", isAuthenticated, "loading =", loading);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 text-slate-400 font-medium">
        <div className="relative flex h-12 w-12 mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-12 w-12 bg-blue-500 items-center justify-center">
            <RefreshCcw className="text-white animate-spin-slow" size={24} />
          </span>
        </div>
        <p className="tracking-widest text-xs font-bold uppercase">Verifying Access...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: User authenticated, showing content");
  return children;
}
