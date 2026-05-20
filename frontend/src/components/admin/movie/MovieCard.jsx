import React from "react";
import { Film, Star, Edit2, Trash2, Calendar, Clock } from "lucide-react";

export default function MovieCard({ movie, onEdit, onDelete }) {
  return (
    <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 group flex flex-col shadow-lg shadow-black/20 relative">
      <div className="relative aspect-[2/3] overflow-hidden bg-zinc-800">
        {movie.posterPath ? (
          <img
            src={movie.posterPath.startsWith("http") ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.posterPath}`}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-12 h-12 text-zinc-700" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10 shadow-sm z-10">
          <Star className="w-3 h-3 fill-current" />
          {movie.voteAverage?.toFixed(1) || "N/A"}
        </div>
        
        <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10">
          {movie.status === "UPCOMING" ? "Sắp chiếu" : movie.status === "NOW_SHOWING" ? "Đang chiếu" : "Ngừng chiếu"}
        </div>

        {/* Actions overlay on hover */}
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-center items-center gap-3 z-20">
          <button
            onClick={() => onEdit(movie)}
            className="w-32 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
          </button>
          <button
            onClick={() => onDelete(movie)}
            className="w-32 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Xóa phim
          </button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-white text-sm line-clamp-2 mb-1 group-hover:text-rose-400 transition-colors" title={movie.title}>
          {movie.title}
        </h3>
        
        <div className="mt-auto pt-3 flex items-center justify-between text-xs font-medium text-zinc-400">
          <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-md">
            <Calendar className="w-3 h-3 text-zinc-500" />
            <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "—"}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-md">
            <Clock className="w-3 h-3 text-zinc-500" />
            <span>{movie.duration}p</span>
          </div>
        </div>
      </div>
    </div>
  );
}
