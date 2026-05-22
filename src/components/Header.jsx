import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { UserMenu } from "@/components/UserMenu.jsx";

const ROUTE_TITLES = {
  "/": "Overview",
  "/dashboard": "Dashboard",
  "/geospatial-status": "Sensor Nodes",
  "/locations": "Sensor Nodes",
  "/data": "Data Logs",
  "/analysis": "ML Analysis",
  "/alerts": "Alerts",
  "/settings": "Settings",
};

function getBreadcrumbs(pathname) {
  if (pathname === "/") {
    return [{ label: "Overview" }];
  }

  if (pathname === "/dashboard") {
    return [
      { label: "Overview", to: "/" },
      { label: "Dashboard" },
    ];
  }

  if (ROUTE_TITLES[pathname]) {
    return [
      { label: "Overview", to: "/" },
      { label: "Dashboard", to: "/dashboard" },
      { label: ROUTE_TITLES[pathname] },
    ];
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return [{ label: "Overview" }];

  return [
    { label: "Overview", to: "/" },
    ...segments.map((segment, index) => ({
      label: segment.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      to: index === segments.length - 1 ? undefined : `/${segments.slice(0, index + 1).join("/")}`,
    })),
  ];
}

export function Header({ title = "Precipitation Rate Monitoring System" }) {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const showBreadcrumbs = location.pathname !== "/";

  return (
    <header className="sticky top-0 z-30 -mx-6 flex min-h-[88px] flex-col justify-center gap-4 border-b border-border/60 bg-background px-6 py-3 sm:flex-row sm:items-center sm:justify-between md:-mx-12 md:min-h-[92px] md:px-12 lg:-mx-14 lg:px-14">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold sm:text-xs sm:tracking-[0.3em]">Monitoring Center</p>
        <h1 className="truncate text-2xl font-black text-foreground tracking-tight">{title}</h1>
        {showBreadcrumbs && (
          <nav aria-label="Breadcrumb" className="mt-2 flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-400">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-300" />}
                {item.to ? (
                  <Link to={item.to} className="transition hover:text-brand-teal">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-500">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>
      <UserMenu />
    </header>
  );
}
