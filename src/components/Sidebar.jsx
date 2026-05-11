import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, LayoutDashboard, Map as MapIcon, Database, Brain, Bell, Menu } from "lucide-react";

function NavItem({ icon, label, isActive, onClick, badge, collapsed }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`group w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all duration-200 text-sm font-bold ${
        isActive
          ? "border-brand-teal/30 text-yellow-400 shadow-sm border bg-white/10"
          : "border border-transparent text-slate-300 hover:bg-white/5 hover:text-yellow-400"
      }`}
    >
      <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
        <span className={`transition-colors duration-200 ${isActive ? "text-yellow-400" : "text-slate-400 group-hover:text-yellow-400"}`}>
          {icon}
        </span>
        {!collapsed && <span>{label}</span>}
      </div>
      {!collapsed && badge && (
        <span className="bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-bounce shadow-[0_0_10px_rgba(239,68,68,0.5)]">
          {badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar({ activeView, node1, node2, lastUpdate }) {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Overview", path: "/", activeKey: "overview" },
    { icon: <MapIcon size={18} />, label: "Sensor Nodes", path: "/locations", activeKey: "locations" },
    { icon: <Database size={18} />, label: "Data Logs", path: "/data", activeKey: "data" },
    { icon: <Brain size={18} />, label: "ML Analysis", path: "/analysis", activeKey: "analysis" },
    { icon: <Bell size={18} />, label: "Alerts", path: "/alerts", activeKey: "alerts", badge: node1?.status === 'offline' || node2?.status === 'offline' ? "!" : null },
  ];

  return (
    <div className={`relative flex flex-col transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="absolute top-4 right-[-1.25rem] z-20 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:bg-white"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Menu size={18} />
      </button>

      <aside className="flex h-full flex-col overflow-hidden rounded-tr-3xl rounded-br-3xl bg-gradient-to-b from-[#004f7a] via-[#00456c] to-[#003250] border-r border-white/10 dark:border-white/5 shadow-xl">
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 ${collapsed ? "p-4" : "p-6"} border-b border-white/10`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-brand-teal w-6 h-6 shrink-0" />
            {!collapsed && (
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight whitespace-nowrap">LAWOM</h1>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mt-2">
                  Network: <span className="text-emerald-400">Online</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 ${collapsed ? "px-2 py-4" : "p-4"} space-y-2`}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              isActive={activeView === item.activeKey}
              badge={item.badge}
              collapsed={collapsed}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <div className={`p-4 border-t border-white/10 bg-black/10 ${collapsed ? "text-center" : ""}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-300 text-center">Last Sync</p>
          <div className={`font-mono text-xs font-bold ${collapsed ? "text-slate-300" : "text-slate-200 bg-white/10 px-3 py-2 rounded-md border border-white/10 shadow-sm text-center"}`}>
            {lastUpdate}
          </div>
        </div>
      </aside>
    </div>
  );
}
