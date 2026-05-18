import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Play, Star, Clock } from "lucide-react";

export default function MovieCard({ movie, index }) {
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileHover={{ opacity: 1, y: 0 }}
          className="translate-y-4 group-hover:translate-y-0 transition-all duration-300"
        >
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
            <button className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center rounded-lg text-white transition-colors">
              <Play size={16} fill="currentColor" />
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Persistent Title (when not hovered) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent group-hover:opacity-0 transition-opacity duration-300">
        <h3 className="text-white font-semibold line-clamp-1">{movie.title}</h3>
        <p className="text-primary text-sm">{movie.genre[0]}</p>
      </div>
    </motion.div>
  );
}
