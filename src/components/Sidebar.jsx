import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Monitor, LayoutDashboard, Activity, Map as MapIcon, Database, Brain, Bell, Menu } from "lucide-react";

const SIDEBAR_COLLAPSED_KEY = "lawom.sidebar.collapsed";

function NavItem({ icon, label, isActive, onClick, badge, collapsed }) {
  return (
    <button
      onClick={onClick}
      title={label}
        className={`group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition-all duration-200 md:w-full md:flex-row md:justify-between md:gap-3 md:px-4 md:py-3 md:text-sm ${
        isActive
          ? "border-[#7da9ca]/28 bg-white/10 text-white shadow-sm"
          : "border border-transparent text-slate-300 hover:bg-white/6 hover:text-slate-100"
      }`}
    >
      <div className={`flex min-w-0 flex-col items-center gap-1 md:flex-row md:gap-3 ${collapsed ? "md:justify-center md:w-full" : ""}`}>
        <span className={`transition-colors duration-200 ${isActive ? "text-[#b7e2f2]" : "text-slate-400 group-hover:text-slate-100"}`}>
          {icon}
        </span>
        <span className={`max-w-full truncate ${collapsed ? "md:hidden" : ""}`}>{label}</span>
      </div>
      {!collapsed && badge && (
        <span className="absolute -mt-8 ml-8 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white shadow-[0_0_10px_rgba(239,68,68,0.5)] md:static md:mt-0 md:ml-0 md:animate-bounce">
          {badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar({ activeView, node1, node2, lastUpdate }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });
  const navigate = useNavigate();

  const navItems = [
    { icon: <LayoutDashboard size={18} />, label: "Overview", path: "/", activeKey: "overview" },
    { icon: <Activity size={18} />, label: "Monitoring Dashboard", path: "/dashboard", activeKey: "dashboard" },
    { icon: <MapIcon size={18} />, label: "Sensor Nodes", path: "/locations", activeKey: "locations" },
    { icon: <Database size={18} />, label: "Data Logs", path: "/data", activeKey: "data" },
    { icon: <Brain size={18} />, label: "ML Analysis", path: "/analysis", activeKey: "analysis" },
    { icon: <Bell size={18} />, label: "Alerts", path: "/alerts", activeKey: "alerts", badge: node1?.status === 'offline' || node2?.status === 'offline' ? "!" : null },
  ];

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const nextValue = !value;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(nextValue));
      } catch {
        // ignore
      }
      return nextValue;
    });
  };

  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 flex h-20 flex-col transition-all duration-300 md:relative md:inset-auto md:h-full md:py-0 md:pl-0 ${collapsed ? "md:w-[5.75rem]" : "md:w-[16.75rem]"}`}>
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute top-4 right-[-1.05rem] z-20 hidden h-11 w-11 items-center justify-center rounded-full border border-[#8ea7bf]/28 bg-[#102237] text-slate-200 shadow-lg transition hover:bg-[#16304d] md:inline-flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Menu size={18} />
      </button>

      <aside className="flex h-full flex-col overflow-hidden rounded-t-2xl border-r border-white/10 bg-gradient-to-b from-[#0a304d] via-[#08263d] to-[#061a2b] shadow-xl md:rounded-[2rem]">
        <div className={`hidden items-center ${collapsed ? "justify-center" : "justify-between"} gap-2 ${collapsed ? "p-4" : "p-6"} border-b border-white/10 md:flex`}>
          <div className="flex items-center gap-2">
            
            <Monitor className="text-[#84d6ec] w-10 h-10 shrink-0" />
            {!collapsed && (
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight whitespace-nowrap">LAWOM</h1>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mt-2">
                  Real-time Rainfall Monitoring
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex flex-1 items-center gap-1 px-2 py-2 md:block md:space-y-2 ${collapsed ? "md:px-2 md:py-4" : "md:p-4"}`}>
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

        <div className={`hidden p-4 border-t border-white/10 bg-black/10 md:block ${collapsed ? "text-center" : ""}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-slate-300 text-center">Last Sync</p>
          <div className={`font-mono text-xs font-bold ${collapsed ? "text-slate-300" : "text-slate-200 bg-white/10 px-3 py-2 rounded-md border border-white/10 shadow-sm text-center"}`}>
            {lastUpdate}
          </div>
        </div>
      </aside>
    </div>
  );
}
