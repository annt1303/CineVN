import { useEffect, useState } from "react";
import HeroSection from "../components/home/HeroSection";
import NowShowingSection from "../components/home/NowShowingSection";
import PromotionSection from "../components/home/PromotionSection";
import { api } from "../services/api";
import { mapDbMovieToFrontend } from "../utils/movieMapper";

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await api.get("/api/public/movies?status=NOW_SHOWING");
        const mapped = data.map(mapDbMovieToFrontend);
        setMovies(mapped);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-xl font-semibold animate-pulse">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <HeroSection movies={movies} />
      <NowShowingSection movies={movies} />
      <PromotionSection />
    </div>
  );
}

