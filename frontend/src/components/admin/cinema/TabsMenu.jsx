import React from "react";
import { Landmark, Tv } from "lucide-react";

export default function TabsMenu({ activeTab, setActiveTab, cinemasCount }) {
  return (
    <div className="flex border-b border-white/5">
      <button
        onClick={() => setActiveTab("cinemas")}
        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
          activeTab === "cinemas"
            ? "border-rose-600 text-white"
            : "border-transparent text-zinc-400 hover:text-white"
        }`}
      >
        <Landmark size={18} />
        Cụm rạp ({cinemasCount})
      </button>
      <button
        onClick={() => setActiveTab("rooms")}
        className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
          activeTab === "rooms"
            ? "border-rose-600 text-white"
            : "border-transparent text-zinc-400 hover:text-white"
        }`}
      >
        <Tv size={18} />
        Phòng chiếu & Sơ đồ ghế
      </button>
    </div>
  );
}
