import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from './context/AuthContext.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { AppLayout } from './components/AppLayout.jsx'
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
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<OverviewPage />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="geospatial-status" element={<Dashboard />} />
            <Route path="locations" element={<Dashboard />} />
            <Route path="data" element={<Dashboard />} />
            <Route path="analysis" element={<Dashboard />} />
            <Route path="alerts" element={<Dashboard />} />
            <Route path="settings" element={<Dashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
