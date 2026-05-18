import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { movies } from "../data/mockData";
import MovieCard from "../components/MovieCard";

export default function Home() {
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroMovies = movies.slice(0, 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  const nextHero = () => setCurrentHeroIndex((prev) => (prev + 1) % heroMovies.length);
  const prevHero = () => setCurrentHeroIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[90vh] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
            <img
              src={heroMovies[currentHeroIndex].backdrop}
              alt={heroMovies[currentHeroIndex].title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 z-20 flex items-center">
          <div className="container mx-auto px-4 md:px-6 pt-20">
            <motion.div
              key={`content-${currentHeroIndex}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold backdrop-blur-sm">
                  CineMax Độc Quyền
                </span>
                <span className="text-gray-300 text-sm">{heroMovies[currentHeroIndex].releaseDate}</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
                {heroMovies[currentHeroIndex].title}
              </h1>
              
              <p className="text-gray-300 text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-xl">
                {heroMovies[currentHeroIndex].description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={`/movie/${heroMovies[currentHeroIndex].id}`}
                  className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-full font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
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
          <button onClick={prevHero} className="w-12 h-12 rounded-full border border-white/20 bg-background/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextHero} className="w-12 h-12 rounded-full border border-white/20 bg-background/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <ChevronRight size={24} />
          </button>
        </div>
      </section>

      {/* Now Showing */}
      <section className="py-20 relative z-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
                Phim Đang Chiếu
              </h2>
              <p className="text-gray-400">Danh sách phim bom tấn đang làm mưa làm gió tại rạp.</p>
            </div>
            <Link to="/all-movies" className="text-primary hover:text-white transition-colors font-medium flex items-center gap-1 group">
              Xem tất cả <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {movies.map((movie, index) => (
              <MovieCard key={movie.id} movie={movie} index={index} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Promotion Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="glass-card rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Thành viên CineMax Club</h2>
              <p className="text-gray-300 mb-6 text-lg">Đăng ký thành viên ngay hôm nay để nhận ưu đãi lên đến 20% cho lần mua vé đầu tiên và tích điểm đổi quà hấp dẫn.</p>
              <button className="px-8 py-3 bg-white text-background hover:bg-gray-200 rounded-full font-bold transition-colors">
                Đăng Ký Ngay
              </button>
            </div>
            <div className="relative z-10 w-full md:w-1/3">
              <img src="https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=2070&auto=format&fit=crop" alt="Popcorn" className="rounded-2xl transform rotate-3 shadow-2xl border-4 border-white/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
