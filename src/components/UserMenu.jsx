import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logout, getUserDisplayName } from "@/lib/authUtils";
import { LogOut, User, Settings, ChevronDown } from "lucide-react";

/**
 * UserMenu - Dropdown with user info and logout button
 * Shows user email/name and quick navigation actions
 */
export function UserMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate("/login");
    }
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate("/settings");
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Menu Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2 bg-blue-100 px-2.5 py-1.5 rounded-lg">
          <User size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-slate-700 max-w-[150px] truncate">
            {getUserDisplayName(user)}
          </span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">Logged in as</p>
            <p className="text-sm font-semibold text-slate-900 mt-1 truncate">{getUserDisplayName(user)}</p>
            <p className="text-xs text-slate-400 mt-1 truncate">{user.email}</p>
          </div>

          <button
            onClick={handleSettings}
            className="w-full px-4 py-3 flex items-center gap-2 text-slate-700 hover:bg-slate-100 transition-colors font-medium text-sm"
          >
            <Settings size={16} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
