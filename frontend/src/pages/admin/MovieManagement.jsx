import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Clock, Star, Film, Loader2, Edit2, Trash2, TrendingUp, Eye, EyeOff, LayoutGrid } from "lucide-react";
import { api } from "../../services/api";
import TmdbSearchModal from "../../components/admin/movie/TmdbSearchModal";
import MovieFormModal from "../../components/admin/movie/MovieFormModal";

export default function MovieManagement() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTmdbModalOpen, setIsTmdbModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState(null);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.get("/api/admin/movies");
      setMovies(result || []);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleCreateMovie = () => {
    setSelectedMovie(null);
    setIsFormModalOpen(true);
  };

  const handleEditMovie = (movie) => {
    setSelectedMovie(movie);
    setIsFormModalOpen(true);
  };

  const handleDeleteMovie = async (movie) => {
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa phim "${movie.title}" không? Hành động này không thể hoàn tác.`);
    if (!confirmDelete) return;

    try {
      setError(null);
      await api.delete(`/api/admin/movies/${movie.id}`);
      fetchMovies();
    } catch (err) {
      setError(err.message || "Không thể xóa phim này. Vui lòng kiểm tra lại.");
    }
  };

  const STATUS_CONFIG = [
    { key: "ALL",         label: "Tất cả",      icon: LayoutGrid,  color: "zinc" },
    { key: "NOW_SHOWING", label: "Đang chiếu",  icon: TrendingUp,  color: "emerald" },
    { key: "UPCOMING",   label: "Sắp chiếu",   icon: Clock,       color: "blue" },
    { key: "ENDED",      label: "Ngừng chiếu", icon: EyeOff,      color: "zinc" },
  ];

  const filteredMovies = movies.filter((movie) => {
    const matchSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.originalTitle && movie.originalTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === "ALL" || movie.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const countByStatus = (key) =>
    key === "ALL" ? movies.length : movies.filter((m) => m.status === key).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
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
            onClick={handleCreateMovie} 
            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Thêm phim
          </button>
          <button 
            onClick={() => setIsTmdbModalOpen(true)} 
            className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nhập từ TMDB
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4">
        {/* Row 1: Search + count */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Tìm kiếm phim trong hệ thống..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all text-sm"
            />
          </div>

          <div className="text-zinc-400 text-sm w-full md:w-auto text-left md:text-right">
            Hiển thị: <span className="font-bold text-white">{filteredMovies.length}</span>
            <span className="text-zinc-600"> / {movies.length}</span> phim
          </div>
        </div>

        {/* Row 2: Status filters */}
        <div className="flex flex-wrap gap-2">
          {STATUS_CONFIG.map(({ key, label, icon: Icon, color }) => {
            const count = countByStatus(key);
            const isActive = statusFilter === key;
            const activeStyles = {
              ALL:         "bg-zinc-700 border-zinc-600 text-white",
              NOW_SHOWING: "bg-emerald-600/20 border-emerald-500 text-emerald-400",
              UPCOMING:    "bg-blue-600/20 border-blue-500 text-blue-400",
              ENDED:       "bg-zinc-700 border-zinc-500 text-zinc-300",
            };
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                  isActive
                    ? activeStyles[key]
                    : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                  isActive ? "bg-white/10" : "bg-zinc-800 text-zinc-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-center text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
          <Film className="w-12 h-12 text-zinc-700" />
          <p className="text-zinc-400 font-medium">Chưa có phim nào trong hệ thống hoặc không tìm thấy phim phù hợp.</p>
          <div className="flex gap-4 mt-2">
            <button 
              onClick={handleCreateMovie}
              className="text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              Thêm phim
            </button>
            <button 
              onClick={() => setIsTmdbModalOpen(true)}
              className="text-rose-500 hover:text-rose-400 text-sm font-semibold self-center"
            >
              Nhập phim đầu tiên từ TMDB
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-white/5 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 group flex flex-col shadow-lg shadow-black/20 relative">
              
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
                    onClick={() => handleEditMovie(movie)}
                    className="w-32 bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteMovie(movie)}
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
          ))}
        </div>
      )}

      <TmdbSearchModal
        isOpen={isTmdbModalOpen}
        onClose={() => setIsTmdbModalOpen(false)}
        onImportSuccess={fetchMovies}
      />

      <MovieFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmitSuccess={fetchMovies}
        movie={selectedMovie}
      />
    </div>
  );
}

