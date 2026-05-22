import { CalendarDays, Clock, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import TrailerModal from "../common/TrailerModal";

export default function MovieInfo({ movie }) {
  if (!movie) return null;

  const [showTrailer, setShowTrailer] = useState(false);

  const formattedReleaseDate = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
    : "Dang cap nhat";

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Poster */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-48 md:w-72 shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 hidden md:block"
      >
        <img src={movie.image} alt={movie.title} className="w-full object-cover" />
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 pt-4 md:pt-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
          <span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-md font-semibold text-rose-400">
            ★ {movie.rating} / 10
          </span>
          <span className="flex items-center gap-1"><Clock size={16} /> {movie.duration}</span>
          <span className="flex items-center gap-1"><CalendarDays size={16} /> {formattedReleaseDate}</span>
          <span className="px-3 py-1 border border-white/20 rounded-full">{movie.genre.join(", ")}</span>
        </div>

        <p className="text-gray-300 text-lg leading-relaxed mb-6">{movie.description}</p>

        {movie.trailerUrl && (
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setShowTrailer(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
            >
              <PlayCircle size={18} />
              Xem trailer
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/5 pt-6">
          <div>
            <span className="text-gray-500 block mb-1">Dao dien</span>
            <span className="text-white font-medium">{movie.director || "Dang cap nhat"}</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Dien vien</span>
            <span className="text-white font-medium">
              {movie.cast.length ? movie.cast.join(", ") : "Dang cap nhat"}
            </span>
          </div>
        </div>
      </motion.div>

      <TrailerModal
        open={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={movie.trailerUrl}
        title={movie.title}
      />
    </div>
  );
}
