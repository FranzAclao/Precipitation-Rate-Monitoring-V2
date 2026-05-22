import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import OverviewPage from './pages/overview/overview.jsx'
import Dashboard from './pages/dashboard/dashboard.jsx'
import Login from './pages/auth/login.jsx'
import Signup from './pages/auth/signup.jsx'
import ResetPassword from './pages/auth/reset-password.jsx'
import './index.css'

// Apply persisted theme ASAP (prevents flash)
try {
  const storedTheme = localStorage.getItem('theme');
  const isDark = storedTheme ? storedTheme === 'dark' : false;
  document.documentElement.classList.toggle('dark', isDark);
} catch {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        {/* PAGE CONTENT SWITCHER */}
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/geospatial-status" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/locations" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/data" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
