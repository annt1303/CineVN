import React from "react";
import { Search, LayoutGrid, TrendingUp, Clock, EyeOff } from "lucide-react";

const STATUS_CONFIG = [
  { key: "ALL",         label: "Tất cả",      icon: LayoutGrid },
  { key: "NOW_SHOWING", label: "Đang chiếu",  icon: TrendingUp },
  { key: "UPCOMING",   label: "Sắp chiếu",   icon: Clock },
  { key: "ENDED",      label: "Ngừng chiếu", icon: EyeOff },
];

export default function MovieToolbar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  totalCount,
  filteredCount,
  countByStatus
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Search + count */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm phim trong hệ thống..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all text-sm"
          />
        </div>

        <div className="text-zinc-400 text-sm w-full md:w-auto text-left md:text-right">
          Hiển thị: <span className="font-bold text-white">{filteredCount}</span>
          <span className="text-zinc-600"> / {totalCount}</span> phim
        </div>
      </div>

      {/* Row 2: Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_CONFIG.map(({ key, label, icon: Icon }) => {
          const count = countByStatus(key);
          const isActive = statusFilter === key;
          const activeStyles = {
            ALL:         "bg-zinc-700 border-zinc-600 text-white",
            NOW_SHOWING: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
            UPCOMING:    "bg-blue-600/20 border-blue-500 text-blue-400",
            ENDED:       "bg-zinc-700 border-zinc-500 text-zinc-300",
          };
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? activeStyles[key]
                  : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                isActive ? "bg-white/10" : "bg-zinc-800 text-zinc-400"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
