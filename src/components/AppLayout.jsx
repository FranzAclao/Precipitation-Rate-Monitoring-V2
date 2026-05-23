import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/Header.jsx";
import { Sidebar } from "@/components/Sidebar.jsx";
import { useFloodData } from "@/hooks/useFloodData";

const VIEW_TITLES = {
  "/": "Overview",
  "/dashboard": "Monitoring Dashboard",
  "/geospatial-status": "Sensor Nodes",
  "/locations": "Sensor Nodes",
  "/data": "Data Logs",
  "/analysis": "ML Analysis",
  "/alerts": "Alerts",
  "/settings": "Settings",
};

const ACTIVE_VIEWS = {
  "/": "overview",
  "/dashboard": "dashboard",
  "/geospatial-status": "locations",
  "/locations": "locations",
  "/data": "data",
  "/analysis": "analysis",
  "/alerts": "alerts",
  "/settings": "settings",
};

export function AppLayout() {
  const location = useLocation();
  const { node1, node2, lastUpdate } = useFloodData();

  const headerTitle = useMemo(() => VIEW_TITLES[location.pathname] || "Dashboard", [location.pathname]);
  const activeView = useMemo(() => ACTIVE_VIEWS[location.pathname] || "dashboard", [location.pathname]);

  return (
    <div className="app-shell flex">
      <Sidebar activeView={activeView} node1={node1} node2={node2} lastUpdate={lastUpdate} />
      <main className="app-main-shell">
        <Header title={headerTitle} />
        <div className="app-main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
