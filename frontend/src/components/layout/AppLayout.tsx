import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Component } from "lucide-react";
import { Toaster } from "../ui/Toast";

export function AppLayout() {
  const isDev = import.meta.env.DEV;

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-slate-100 font-sans">
      <Toaster />
      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-[#09090b]/50 backdrop-blur-md flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
            ACME HR
          </h1>
          <p className="text-xs text-slate-500 mt-1">Management Console</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-slate-800 text-indigo-400 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`
            }
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>
          
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-slate-800 text-indigo-400 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`
            }
          >
            <Users size={18} />
            Employee Directory
          </NavLink>

          {isDev && (
            <NavLink
              to="/design-system"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors mt-8 border border-dashed border-slate-700 ${
                  isActive
                    ? "bg-slate-800 text-indigo-400 font-medium"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`
              }
            >
              <Component size={18} />
              Design System
            </NavLink>
          )}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
              HR
            </div>
            <div className="text-xs">
              <p className="font-medium text-slate-200">HR Manager</p>
              <p className="text-slate-500">Admin Console</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-[#09090b]">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
