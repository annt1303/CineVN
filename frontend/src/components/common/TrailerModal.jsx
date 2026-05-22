import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const getYoutubeEmbedUrl = (url) => {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/i
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : "";
};

export default function TrailerModal({ open, onClose, trailerUrl, title }) {
  const trailerEmbedUrl = getYoutubeEmbedUrl(trailerUrl);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
              aria-label="Close trailer"
            >
              <X size={20} />
            </button>

            {trailerEmbedUrl ? (
              <iframe
                className="w-full aspect-video"
                src={trailerEmbedUrl}
                title={`Trailer ${title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="p-8 text-center text-white">
                <a href={trailerUrl} target="_blank" rel="noreferrer" className="text-red-300 hover:text-red-200">
                  Khong the nhung trailer, bam day de mo lien ket
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
