import React from "react";
import { Film, Plus } from "lucide-react";

export default function MovieHeader({ onCreateMovie, onOpenTmdbImport }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 border border-white/5 p-6 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
      
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Film className="w-7 h-7 text-rose-500" />
          Quản lý Phim
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          Xem danh sách phim trong hệ thống, tự thêm phim thủ công hoặc nhập dữ liệu phim mới từ hệ thống TMDB
        </p>
      </div>
      
      <div className="relative z-10 flex flex-wrap gap-3">
        <button 
          onClick={onCreateMovie} 
          className="bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Thêm phim
        </button>
        <button 
          onClick={onOpenTmdbImport} 
          className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nhập từ TMDB
        </button>
      </div>
    </div>
  );
}
