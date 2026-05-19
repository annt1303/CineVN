import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { LayoutDashboard, Landmark } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: "Tổng quan", path: "/admin", icon: LayoutDashboard },
    { name: "Quản lý Rạp & Phòng", path: "/admin/cinemas", icon: Landmark },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        menuItems={menuItems}
      />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-zinc-950 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
