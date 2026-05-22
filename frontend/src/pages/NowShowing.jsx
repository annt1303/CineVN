import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List,
  Star,
  Clock,
  Play,
  Filter,
  X,
  ChevronRight,
  Film,
  SlidersHorizontal,
} from "lucide-react";
import { api } from "../services/api";
import { mapDbMovieToFrontend } from "../utils/movieMapper";
import TrailerModal from "../components/common/TrailerModal";

const GENRES = ["Tất cả", "Hành động", "Tình cảm", "Hài", "Kinh dị", "Hoạt hình", "Khoa học viễn tưởng", "Tâm lý", "Phiêu lưu"];

const SORT_OPTIONS = [
  { label: "Mới nhất", value: "newest" },
  { label: "Đánh giá cao nhất", value: "rating" },
  { label: "Tên A-Z", value: "az" },
];

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-secondary animate-pulse">
      <div className="aspect-[2/3] bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/5 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

// Grid movie card
function GridMovieCard({ movie, index }) {
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.5) }}
        className="group relative rounded-2xl overflow-hidden aspect-[2/3] bg-secondary cursor-pointer"
      >
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2 py-1 rounded-full border border-yellow-400/20">
          <Star size={10} fill="currentColor" />
          {movie.rating}
        </div>

        {/* Now Showing badge */}
        <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">
          Đang chiếu
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-10">
          <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
                <Star size={11} fill="currentColor" /> {movie.rating}
              </span>
              <span className="flex items-center gap-1 text-gray-300 text-xs">
                <Clock size={11} /> {movie.duration}
              </span>
            </div>

            <h3 className="text-white font-bold text-sm mb-1 leading-tight line-clamp-2">
              {movie.title}
            </h3>

            <p className="text-gray-400 text-xs mb-3 line-clamp-1">
              {movie.genre.join(", ")}
            </p>

            <div className="flex gap-2">
              <Link
                to={`/movie/${movie.id}`}
                className="flex-1 bg-primary hover:bg-primary-hover text-white text-center py-2 rounded-lg text-xs font-semibold transition-colors"
              >
                Đặt vé
              </Link>
              <button
                onClick={handlePlayClick}
                className="w-9 h-9 bg-white/10 hover:bg-white/20 flex items-center justify-center rounded-lg text-white transition-colors cursor-pointer"
                title={movie.trailerUrl ? "Xem trailer" : "Không có trailer"}
              >
                <Play size={14} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom title (non-hover) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
          <h3 className="text-white font-semibold text-sm line-clamp-1">{movie.title}</h3>
          <p className="text-primary text-xs">{movie.genre[0]}</p>
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
      </motion.div>

      <TrailerModal
        open={showTrailer}
        onClose={() => setShowTrailer(false)}
        trailerUrl={movie.trailerUrl}
        title={movie.title}
      />
    </>
  );
}

// List movie card
function ListMovieCard({ movie, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      className="group glass-card rounded-2xl overflow-hidden flex gap-4 p-3 hover:border-white/10 transition-all duration-300 hover:bg-white/5"
    >
      {/* Poster */}
      <Link to={`/movie/${movie.id}`} className="flex-shrink-0 w-[90px] rounded-xl overflow-hidden aspect-[2/3] relative">
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link to={`/movie/${movie.id}`}>
              <h3 className="text-white font-bold text-base leading-tight line-clamp-2 hover:text-primary transition-colors">
                {movie.title}
              </h3>
            </Link>
            <span className="flex-shrink-0 flex items-center gap-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full border border-yellow-400/20">
              <Star size={10} fill="currentColor" /> {movie.rating}
            </span>
          </div>

          {movie.originalTitle && (
            <p className="text-gray-500 text-xs mb-2 line-clamp-1 italic">{movie.originalTitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {movie.genre.slice(0, 3).map((g) => (
              <span key={g} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/5">
                {g}
              </span>
            ))}
            <span className="flex items-center gap-1 text-gray-500 text-xs">
              <Clock size={10} /> {movie.duration}
            </span>
          </div>

          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
            {movie.description || "Nội dung đang cập nhật..."}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Link
            to={`/movie/${movie.id}`}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Đặt vé <ChevronRight size={13} />
          </Link>
          <span className="text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full font-bold">
            Đang chiếu
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function NowShowing() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchMovies = async () => {
      try {
        const data = await api.get("/api/public/movies?status=NOW_SHOWING");
        const mapped = data.map(mapDbMovieToFrontend);
        setMovies(mapped);
      } catch (error) {
        console.error("Failed to fetch now showing movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Extract all unique genres from fetched movies
  const availableGenres = useMemo(() => {
    const genreSet = new Set();
    movies.forEach((m) => m.genre.forEach((g) => genreSet.add(g)));
    return ["Tất cả", ...Array.from(genreSet)];
  }, [movies]);

  const displayGenres = availableGenres.length > 2 ? availableGenres : GENRES;

  // Filter + sort
  const filteredMovies = useMemo(() => {
    let result = [...movies];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(q)) ||
          m.genre.some((g) => g.toLowerCase().includes(q))
      );
    }

    // Genre filter
    if (selectedGenre !== "Tất cả") {
      result = result.filter((m) => m.genre.includes(selectedGenre));
    }

    // Sort
    if (sortBy === "rating") {
      result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    } else if (sortBy === "az") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // newest — keep natural order or sort by releaseDate desc
      result.sort((a, b) => {
        if (!a.releaseDate || !b.releaseDate) return 0;
        return new Date(b.releaseDate) - new Date(a.releaseDate);
      });
    }

    return result;
  }, [movies, searchQuery, selectedGenre, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden pt-16">
        {/* Ambient background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute -top-20 right-0 w-[400px] h-[400px] bg-rose-900/10 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 py-14 md:py-20">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-500 mb-6"
          >
            <Link to="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <ChevronRight size={14} />
            <span className="text-gray-300">Phim đang chiếu</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-10 bg-primary rounded-full" />
              <span className="text-primary text-sm font-bold uppercase tracking-widest">Đang chiếu</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Phim Đang Chiếu
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Khám phá những bộ phim bom tấn đang chiếu tại rạp. Đặt vé ngay để có trải nghiệm điện ảnh tuyệt vời nhất!
            </p>

            {/* Stats */}
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-6 mt-6"
              >
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Film size={16} className="text-primary" />
                  <span><span className="text-white font-bold">{movies.length}</span> phim</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star size={16} className="text-yellow-400" />
                  <span>Đang cập nhật</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <div className="sticky top-[60px] z-30 bg-background/90 backdrop-blur-xl border-b border-white/5 shadow-lg">
        <div className="container mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-secondary/60 border border-white/5 text-white placeholder-gray-500 pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary/50 focus:bg-secondary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-secondary/60 border border-white/5 text-white pl-3 pr-8 py-2.5 rounded-xl text-sm focus:outline-none focus:border-primary/50 cursor-pointer transition-all"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-zinc-900">
                    {opt.label}
                  </option>
                ))}
              </select>
              <SlidersHorizontal size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            {/* Filter toggle (mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer md:hidden ${
                showFilters ? "bg-primary border-primary text-white" : "bg-secondary/60 border-white/5 text-gray-300 hover:border-white/20"
              }`}
            >
              <Filter size={15} />
              Thể loại
            </button>

            {/* View mode */}
            <div className="flex items-center bg-secondary/60 border border-white/5 rounded-xl p-1 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"}`}
                title="Dạng lưới"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "list" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white"}`}
                title="Dạng danh sách"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex gap-8">
          {/* ── Sidebar Filters (desktop) ── */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-[130px] space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <Filter size={12} /> Thể loại
                </h3>
                <div className="flex flex-col gap-1">
                  {displayGenres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                        selectedGenre === genre
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Movie Grid/List ── */}
          <div className="flex-1 min-w-0">
            {/* Mobile genre filter */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden mb-5 overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 py-2">
                    {displayGenres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => { setSelectedGenre(genre); setShowFilters(false); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                          selectedGenre === genre
                            ? "bg-primary border-primary text-white"
                            : "border-white/10 text-gray-400 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                {loading ? (
                  <span className="animate-pulse">Đang tải...</span>
                ) : (
                  <>
                    Hiển thị{" "}
                    <span className="text-white font-semibold">{filteredMovies.length}</span>{" "}
                    {selectedGenre !== "Tất cả" && (
                      <>trong thể loại <span className="text-primary font-semibold">{selectedGenre}</span></>
                    )}
                    {searchQuery && (
                      <> cho "<span className="text-primary">{searchQuery}</span>"</>
                    )}
                  </>
                )}
              </p>

              {(selectedGenre !== "Tất cả" || searchQuery) && !loading && (
                <button
                  onClick={() => { setSelectedGenre("Tất cả"); setSearchQuery(""); }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5"
                >
                  <X size={12} /> Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Loading skeletons */}
            {loading && (
              <div className={`grid gap-5 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"}`}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && filteredMovies.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                  <Film size={36} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Không tìm thấy phim</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Không có phim nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi thể loại hoặc từ khóa tìm kiếm.
                </p>
                <button
                  onClick={() => { setSelectedGenre("Tất cả"); setSearchQuery(""); }}
                  className="mt-6 flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  <X size={15} /> Xóa bộ lọc
                </button>
              </motion.div>
            )}

            {/* Movie Grid */}
            {!loading && filteredMovies.length > 0 && viewMode === "grid" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {filteredMovies.map((movie, index) => (
                  <GridMovieCard key={movie.id} movie={movie} index={index} />
                ))}
              </div>
            )}

            {/* Movie List */}
            {!loading && filteredMovies.length > 0 && viewMode === "list" && (
              <div className="flex flex-col gap-4">
                {filteredMovies.map((movie, index) => (
                  <ListMovieCard key={movie.id} movie={movie} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
