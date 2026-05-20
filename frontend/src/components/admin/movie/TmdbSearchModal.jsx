import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Download, AlertCircle, Film, Calendar, Star, X, TrendingUp, Clock } from "lucide-react";
import { api } from "../../../services/api";

const TABS = [
  { key: "search",      label: "Tìm kiếm",    icon: Search },
  { key: "now_playing", label: "Đang chiếu",  icon: TrendingUp },
  { key: "upcoming",    label: "Sắp chiếu",   icon: Clock },
];

export default function TmdbSearchModal({ isOpen, onClose, onImportSuccess }) {
  const [activeTab, setActiveTab]   = useState("search");
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [importingId, setImportingId]       = useState(null);
  const [importedIds, setImportedIds]       = useState(new Set());
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);

  /* ── Fetch browse tabs (now_playing / upcoming) on tab change ── */
  const fetchBrowse = useCallback(async (tab) => {
    setLoadingContent(true);
    setError(null);
    setResults([]);
    try {
      const endpoint = tab === "now_playing"
        ? "/api/admin/movies/tmdb/now-playing?page=1"
        : "/api/admin/movies/tmdb/upcoming?page=1";
      const result = await api.get(endpoint);
      setResults(result.results || []);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu từ TMDB.");
    } finally {
      setLoadingContent(false);
    }
  }, []);

  /* Auto-load when switching to browse tabs */
  useEffect(() => {
    if (!isOpen) return;
    if (activeTab !== "search") {
      fetchBrowse(activeTab);
    } else {
      setResults([]);
    }
  }, [activeTab, isOpen, fetchBrowse]);

  /* Reset on close */
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setError(null);
      setSuccess(null);
      setActiveTab("search");
      setImportedIds(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /* ── Search handler ── */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoadingContent(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await api.get(`/api/admin/movies/tmdb/search?query=${encodeURIComponent(query)}`);
      setResults(result.results || []);
    } catch (err) {
      setError(err.message || "Không thể kết nối đến máy chủ.");
    } finally {
      setLoadingContent(false);
    }
  };

  /* ── Import handler ── */
  const handleImport = async (tmdbId) => {
    setImportingId(tmdbId);
    setError(null);
    setSuccess(null);
    try {
      await api.post(`/api/admin/movies/tmdb/import/${tmdbId}`);
      setImportedIds((prev) => new Set(prev).add(tmdbId));
      setSuccess("Nhập phim thành công!");
      onImportSuccess();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || "Không thể nhập phim. Có thể phim đã tồn tại.");
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl">

        {/* ── Header ── */}
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/60 flex-shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-rose-500" />
            Nhập phim từ TMDB
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors hover:bg-zinc-800 rounded-lg p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="px-5 pt-4 flex gap-2 flex-shrink-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setError(null); setSuccess(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === key
                  ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Search input (only for search tab) ── */}
        {activeTab === "search" && (
          <div className="px-5 pt-3 pb-1 flex-shrink-0">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Nhập tên phim (ví dụ: Avengers, Spider-Man...)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loadingContent || !query.trim()}
                className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-rose-600/20"
              >
                {loadingContent ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tìm"}
              </button>
            </form>
          </div>
        )}

        {/* ── Status messages ── */}
        {(error || success) && (
          <div className="px-5 pt-3 flex-shrink-0">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
                <Star className="w-4 h-4 flex-shrink-0 fill-current" /> {success}
              </div>
            )}
          </div>
        )}

        {/* ── Results grid ── */}
        <div className="flex-1 overflow-y-auto p-5">
          {loadingContent ? (
            <div className="h-48 flex items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-sm">Đang tải dữ liệu từ TMDB...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-3 text-zinc-600">
              <Film className="w-10 h-10" />
              <p className="text-sm">
                {activeTab === "search"
                  ? "Nhập tên phim và nhấn Tìm để xem kết quả"
                  : "Không có dữ liệu"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col hover:border-zinc-700 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="relative">
                    <img
                      src={
                        movie.poster_path
                          ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                          : "https://placehold.co/200x300/27272a/71717a?text=No+Poster"
                      }
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover bg-zinc-800"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      <Star className="w-3 h-3 fill-current" />
                      {movie.vote_average?.toFixed(1) || "N/A"}
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1 gap-2">
                    <h3 className="font-bold text-white text-sm line-clamp-2 leading-snug" title={movie.title}>
                      {movie.title}
                    </h3>
                    <p className="text-zinc-500 text-xs truncate" title={movie.original_title}>
                      {movie.original_title}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-auto">
                      <Calendar className="w-3 h-3" />
                      {movie.release_date ? movie.release_date.substring(0, 4) : "N/A"}
                    </div>
                    <button
                      onClick={() => handleImport(movie.id)}
                      disabled={importingId === movie.id || importedIds.has(movie.id)}
                      className={`w-full border px-3 py-2 rounded-lg font-medium text-xs transition-all flex items-center justify-center gap-1.5 disabled:cursor-not-allowed group ${
                        importedIds.has(movie.id)
                          ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400 opacity-80"
                          : "bg-zinc-800 hover:bg-rose-600 hover:border-rose-500 text-white border-zinc-700 disabled:opacity-50"
                      }`}
                    >
                      {importingId === movie.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Đang nhập...
                        </>
                      ) : importedIds.has(movie.id) ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-current" /> Đã nhập
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" /> Nhập Phim
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
