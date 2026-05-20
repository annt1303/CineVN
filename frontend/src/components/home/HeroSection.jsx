import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Play, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function HeroSection({ movies }) {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroMovies = movies ? movies.slice(0, 5) : [];

  // Track the scroll position of the page
  const { scrollY } = useScroll();

  // Create smooth parallax transform values
  const yBg = useTransform(scrollY, [0, 800], [0, 200]);
  const scaleBg = useTransform(scrollY, [0, 800], [1, 1.05]);
  const yText = useTransform(scrollY, [0, 500], [0, -80]);
  const opacityText = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    if (heroMovies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  const nextHero = () => {
    if (heroMovies.length === 0) return;
    setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
  };
  
  const prevHero = () => {
    if (heroMovies.length === 0) return;
    setCurrentHeroIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  if (heroMovies.length === 0) {
    return null;
  }

  const activeMovie = heroMovies[currentHeroIndex];

  return (
    <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentHeroIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          style={{ y: yBg, scale: scaleBg }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
          <img
            src={activeMovie.backdrop}
            alt={activeMovie.title}
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 flex items-center">
        <div className="container mx-auto px-4 md:px-6 pt-20">
          <motion.div
            key={`content-${currentHeroIndex}`}
            style={{ y: yText, opacity: opacityText }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold backdrop-blur-sm">
                CineVN Độc Quyền
              </span>
              <span className="text-gray-300 text-sm">{activeMovie.releaseDate}</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
              {activeMovie.title}
            </h1>
            
            <p className="text-gray-300 text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-xl">
              {activeMovie.description}
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={`/movie/${activeMovie.id}`}
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-primary/30 animate-pulse-subtle"
              >
                <Play size={20} fill="currentColor" /> Đặt Vé Ngay
              </Link>
              <button className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full font-semibold flex items-center gap-2 transition-all">
                <Info size={20} /> Chi Tiết
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-10 right-4 md:right-10 z-30 flex items-center gap-3">
        <button onClick={prevHero} className="w-12 h-12 rounded-full border border-white/20 bg-background/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextHero} className="w-12 h-12 rounded-full border border-white/20 bg-background/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer">
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}
