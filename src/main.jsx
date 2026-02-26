import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import App from './pages/dashboard/dashboard.jsx' // Your Dashboard
import Data from './pages/datalogs/data.jsx'
import Analysis from './pages/analysis/analysis.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* GLOBAL NAVIGATION BAR */}
      {/* Changed bg-slate-900 to bg-blue-600 for that Azure Blue look */}
      <div className="bg-cyan-900 text-white p-4 flex justify-between items-center shadow-md">
        <div className="font-bold text-xl tracking-tighter">FLOODSENSE v2</div>
        <nav className="flex gap-6 text-sm font-medium">
          {/* Tip: I changed the hover text to cyan-200 so it contrasts better against the new blue background */}
          <Link to="/" className="hover:text-yellow-200 transition-colors">DASHBOARD</Link>
          <Link to="/data" className="hover:text-yellow-200 transition-colors">DATA LOGS</Link>
          <Link to="/analysis" className="hover:text-yellow-200 transition-colors">ML ANALYSIS</Link>
        </nav>
      </div>

      {/* PAGE CONTENT SWITCHER */}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/data" element={<Data />} />
        <Route path="/analysis" element={<Analysis />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)