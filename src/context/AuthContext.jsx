import React, { createContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

/**
 * AuthContext - Global auth state management
 * Provides current user info and loading state to entire app
 */
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor Firebase auth state changes
  useEffect(() => {
    console.log("AuthContext: Setting up auth listener");
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        console.log("Auth state changed:", currentUser?.email || "No user");
        setUser(currentUser);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Auth error:", err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      console.log("AuthContext: Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
