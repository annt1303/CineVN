import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Star, Clock } from "lucide-react";
import TrailerModal from "../common/TrailerModal";

export default function MovieCard({ movie, index }) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [showNoTrailer, setShowNoTrailer] = useState(false);

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (movie.trailerUrl) {
      setShowTrailer(true);
    } else {
      setShowNoTrailer(true);
      setTimeout(() => setShowNoTrailer(false), 2500);
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative rounded-2xl overflow-hidden aspect-[2/3] bg-secondary"
      >
        <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 z-10 pointer-events-none group-hover:pointer-events-auto">
          <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center gap-1 text-yellow-400 text-sm font-medium">
              <Star size={14} fill="currentColor" /> {movie.rating}
            </span>
              <span className="flex items-center gap-1 text-gray-300 text-sm">
              <Clock size={14} /> {movie.duration}
            </span>
            </div>

            <h3 className="text-white font-bold text-lg mb-1 leading-tight line-clamp-2">
              {movie.title}
            </h3>

            <p className="text-gray-400 text-sm mb-4 line-clamp-1">
              {movie.genre.join(", ")}
            </p>

            <div className="flex gap-2">
              <Link
                  to={`/movie/${movie.id}`}
                  className="flex-1 bg-primary hover:bg-primary-hover text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Đặt vé
              </Link>

              <button
                  onClick={handlePlayClick}
                  className={`w-10 h-10 backdrop-blur-md flex items-center justify-center rounded-lg text-white transition-colors cursor-pointer bg-white/10 hover:bg-white/20 `}
                  title={movie.trailerUrl ? "Xem trailer" : "Không có trailer"}
              >
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        {/* Persistent Title (when not hovered) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
          <h3 className="text-white font-semibold line-clamp-1">{movie.title}</h3>
          <p className="text-primary text-sm">{movie.genre[0]}</p>
        </div>

        <AnimatePresence>
          {showNoTrailer && (
              <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap border border-white/10"
              >
                Phim này chưa có trailer
              </motion.div>
          )}
        </AnimatePresence>

        <TrailerModal
          open={showTrailer}
          onClose={() => setShowTrailer(false)}
          trailerUrl={movie.trailerUrl}
          title={movie.title}
        />
      </motion.div>
  );
}
