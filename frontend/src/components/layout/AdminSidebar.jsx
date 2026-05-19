import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/cn";

export default function AdminSidebar({ collapsed, setCollapsed, menuItems }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Automatically collapse sidebar on small screens (< 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize(); // Check initial size
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed]);

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }
  };

  return (
    <aside
      className={cn(
        "fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 bg-zinc-900/40 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between py-6 px-4",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div>
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between mb-10 px-2">
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Cine<span className="text-rose-600">VN</span> <span className="text-[10px] bg-rose-600/20 text-rose-400 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={handleLinkClick}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group relative cursor-pointer",
                  isActive
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                )}
              >
                <Icon size={20} className={cn("flex-shrink-0", isActive ? "text-white" : "text-rose-500")} />
                {!collapsed && <span>{item.name}</span>}
                
                {collapsed && (
                  <div className="absolute left-16 bg-zinc-900 border border-white/10 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
