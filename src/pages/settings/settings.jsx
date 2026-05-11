import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logout, getUserDisplayName } from "@/lib/authUtils";
import { LogOut, Moon, Sun, User, Settings } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    try {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) return storedTheme === "dark";
      return false;
    } catch {
      return false;
    }
  });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle("dark", isDark);
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // ignore
    }
  }, [isDark]);

  const handleSignOut = async () => {
    setSigningOut(true);
    const result = await logout();
    if (result.success) {
      navigate("/login");
      return;
    }
    setSigningOut(false);
  };

  if (!user) {
    return (
      <div className="space-y-4 p-6 rounded-2xl bg-card text-card-foreground shadow-sm border border-border">
        <p className="text-sm text-muted-foreground">No user data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <Settings className="text-blue-600" size={28} />
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground font-medium">Manage your profile, preferences, and account access.</p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <div className="bg-card text-card-foreground rounded-3xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Profile</p>
                <h3 className="text-xl font-black text-foreground mt-2">Personal Info</h3>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <User size={16} />
                Account
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoCard title="Name" value={getUserDisplayName(user)} />
              <InfoCard title="Email" value={user.email || "Not provided"} />
              <InfoCard title="Member Since" value={user.metadata?.creationTime || "Unknown"} />
              <InfoCard title="Last Login" value={user.metadata?.lastSignInTime || "Unknown"} />
            </div>
          </div>

          <div className="bg-card text-card-foreground rounded-3xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Appearance</p>
                <h3 className="text-xl font-black text-foreground mt-2">Theme</h3>
              </div>
              <div className="text-sm text-slate-500">Toggle between light and dark mode</div>
            </div>

            <button
              type="button"
              onClick={() => setIsDark((value) => !value)}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? "Dark mode" : "Light mode"}
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-card text-card-foreground rounded-3xl border border-border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold">Account</p>
                <h3 className="text-xl font-black text-foreground mt-2">Security</h3>
              </div>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Protected</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground mb-6">
              Only authenticated users can access this monitoring system. Use the button below to safely sign out.
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut size={18} />
              {signingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-bold mb-3">{title}</p>
      <p className="text-sm font-semibold text-foreground leading-6 break-words">{value}</p>
    </div>
  );
}
