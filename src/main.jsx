import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from './pages/dashboard/dashboard.jsx'
import './index.css'

// Apply persisted theme ASAP (prevents flash)
try {
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
  const isDark = storedTheme ? storedTheme === 'dark' : Boolean(prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
} catch {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* PAGE CONTENT SWITCHER */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/geospatial-status" element={<Dashboard />} />
        <Route path="/data" element={<Dashboard />} />
        <Route path="/analysis" element={<Dashboard />} />
        <Route path="/system-events" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
