import React from "react";
import { Landmark, Tv, Ticket, Users, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { name: "Tổng số rạp", value: "3 cụm rạp", icon: Landmark, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Tổng số phòng chiếu", value: "12 phòng", icon: Tv, iconColor: "text-rose-500", bg: "bg-rose-500/10" },
    { name: "Vé đã bán", value: "1,240 vé", icon: Ticket, color: "text-amber-500", bg: "bg-amber-500/10" },
    { name: "Khách hàng", value: "320 thành viên", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Tổng quan hệ thống</h1>
        <p className="text-zinc-400 mt-1">Xin chào Admin! Chào mừng bạn quay trở lại trang quản trị CineVN.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-zinc-900 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-400">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-xl ${stat.bg} ${stat.color || stat.iconColor}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <TrendingUp className="text-rose-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Thống kê hoạt động</h2>
        <p className="text-zinc-400 max-w-sm">Hệ thống đang hoạt động ổn định. Để cấu hình sơ đồ ghế ngồi và rạp chiếu phim, vui lòng chọn menu "Quản lý Rạp & Phòng".</p>
      </div>
    </div>
  );
}
