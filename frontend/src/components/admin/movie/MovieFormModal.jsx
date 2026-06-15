import React, { useState, useEffect } from "react";
import { X, Loader2, Save, Film, Calendar, Clock, Star, Video, Image, User, Users, Info, ChevronDown } from "lucide-react";
import { api } from "../../../services/api";

export default function MovieFormModal({ isOpen, onClose, onSubmitSuccess, movie }) {
  const isEdit = !!movie;
  const [genres, setGenres] = useState([]);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    originalTitle: "",
    overview: "",
    duration: "",
    releaseDate: "",
    endDate: "",
    posterPath: "",
    backdropPath: "",
    trailerUrl: "",
    director: "",
    cast: "",
    voteAverage: "",
    status: "UPCOMING",
    genreIds: [],
  });

  // Fetch Genres list
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        const response = await api.get("/api/admin/genres");
        setGenres(response || []);
      } catch (err) {
        console.error("Lỗi khi tải thể loại:", err);
      } finally {
        setLoadingGenres(false);
      }
    };
    
    fetchGenres();
  }, [isOpen]);

  // Load movie data if in edit mode
  useEffect(() => {
    if (isOpen && movie) {
      setFormData({
        title: movie.title || "",
        originalTitle: movie.originalTitle || "",
        overview: movie.overview || "",
        duration: movie.duration || "",
        releaseDate: movie.releaseDate || "",
        endDate: movie.endDate || "",
        posterPath: movie.posterPath || "",
        backdropPath: movie.backdropPath || "",
        trailerUrl: movie.trailerUrl || "",
        director: movie.director || "",
        cast: movie.cast ? movie.cast.join(", ") : "",
        voteAverage: movie.voteAverage !== null && movie.voteAverage !== undefined ? movie.voteAverage : "",
        status: movie.status || "UPCOMING",
        genreIds: movie.genres ? movie.genres.map(g => g.id) : [],
      });
    } else if (isOpen && !movie) {
      setFormData({
        title: "",
        originalTitle: "",
        overview: "",
        duration: "",
        releaseDate: "",
        endDate: "",
        posterPath: "",
        backdropPath: "",
        trailerUrl: "",
        director: "",
        cast: "",
        voteAverage: "",
        status: "UPCOMING",
        genreIds: [],
      });
    }
    setError(null);
  }, [isOpen, movie]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenreToggle = (genreId) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.genreIds.includes(genreId);
      const newGenreIds = isAlreadySelected
        ? prev.genreIds.filter((id) => id !== genreId)
        : [...prev.genreIds, genreId];
      return { ...prev, genreIds: newGenreIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tên phim.");
      return;
    }
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      setError("Thời lượng phim phải lớn hơn 0 phút.");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Format cast from comma-separated string to array
    const castArray = formData.cast
      ? formData.cast.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      ...formData,
      duration: parseInt(formData.duration),
      voteAverage: formData.voteAverage ? parseFloat(formData.voteAverage) : null,
      cast: castArray,
      releaseDate: formData.releaseDate || null,
      endDate: formData.endDate || null,
      genreIds: formData.genreIds,
    };

    try {
      if (isEdit) {
        await api.put(`/api/admin/movies/${movie.id}`, payload);
      } else {
        await api.post("/api/admin/movies", payload);
      }
      onSubmitSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi khi lưu thông tin phim.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/3 animate-pulse" />

        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40 relative z-10 flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <Film className="w-6 h-6 text-rose-500" />
            {isEdit ? "Chỉnh sửa thông tin Phim" : "Thêm Phim Mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors hover:bg-zinc-800 rounded-xl p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-start gap-3">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Core Fields */}
            <div className="space-y-5">
              {/* Tên phim */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Tên Phim *</label>
                <div className="relative">
                  <Film className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Tên tiếng Việt hoặc tên chính thức..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Tên gốc */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Tên gốc (Original Title)</label>
                <div className="relative">
                  <Film className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    name="originalTitle"
                    value={formData.originalTitle}
                    onChange={handleChange}
                    placeholder="Tên tiếng Anh hoặc tên gốc của phim..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Thời lượng & Ngày khởi chiếu */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Thời lượng *</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      name="duration"
                      required
                      min="1"
                      value={formData.duration}
                      onChange={handleChange}
                      placeholder="Phút"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Ngày khởi chiếu</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleChange}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Ngày kết thúc chiếu & Điểm đánh giá */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Ngày kết thúc chiếu</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Điểm đánh giá (0-10)</label>
                  <div className="relative">
                    <Star className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="number"
                      name="voteAverage"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.voteAverage}
                      onChange={handleChange}
                      placeholder="Ví dụ: 8.5"
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>
              </div>

              {/* Đạo diễn & Trạng thái phim */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Đạo diễn</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      name="director"
                      value={formData.director}
                      onChange={handleChange}
                      placeholder="Tên đạo diễn..."
                      className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Trạng thái phim *</label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={true}
                      title="Trạng thái được cập nhật tự động dựa trên Ngày chiếu và Ngày kết thúc chiếu"
                      className="w-full bg-zinc-900/30 border border-zinc-800/80 text-zinc-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none cursor-not-allowed appearance-none"
                    >
                      <option value="UPCOMING">Sắp chiếu (Upcoming)</option>
                      <option value="NOW_SHOWING">Đang chiếu (Now Showing)</option>
                      <option value="ENDED">Ngừng chiếu (Ended)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Media, Cast & Genres */}
            <div className="space-y-5">
              {/* Poster URL */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Đường dẫn Poster (Poster URL/Path)</label>
                <div className="relative">
                  <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    name="posterPath"
                    value={formData.posterPath}
                    onChange={handleChange}
                    placeholder="/path_từ_tmdb hoặc link ảnh https://..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Backdrop URL */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Đường dẫn Ảnh nền (Backdrop URL/Path)</label>
                <div className="relative">
                  <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    name="backdropPath"
                    value={formData.backdropPath}
                    onChange={handleChange}
                    placeholder="/path_từ_tmdb hoặc link ảnh https://..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Trailer URL */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Link Trailer (YouTube URL)</label>
                <div className="relative">
                  <Video className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    name="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={handleChange}
                    placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>

              {/* Diễn viên */}
              <div>
                <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Diễn viên (phân tách bằng dấu phẩy)</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    name="cast"
                    value={formData.cast}
                    onChange={handleChange}
                    placeholder="Ví dụ: Robert Downey Jr., Chris Evans, Scarlett Johansson"
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Full-width: Overview */}
          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-2">Tóm tắt nội dung phim (Overview)</label>
            <textarea
              name="overview"
              rows="4"
              value={formData.overview}
              onChange={handleChange}
              placeholder="Nhập tóm tắt nội dung phim cốt truyện..."
              className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-rose-500 text-white rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Full-width: Genres */}
          <div>
            <label className="block text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">Thể loại phim</label>
            {loadingGenres ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500 p-2">
                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                <span>Đang tải danh sách thể loại...</span>
              </div>
            ) : genres.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">Không có thể loại nào được tìm thấy. Thể loại được tự động đồng bộ khi bạn import từ TMDB.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl max-h-48 overflow-y-auto">
                {genres.map((genre) => {
                  const isChecked = formData.genreIds.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => handleGenreToggle(genre.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all ${
                        isChecked
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                          : "bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                        isChecked
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "border-zinc-700 bg-transparent"
                      }`}>
                        {isChecked && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                      </div>
                      <span className="truncate">{genre.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900/40 relative z-10 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all text-sm font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Cập nhật" : "Lưu phim"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
