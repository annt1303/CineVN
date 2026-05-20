import React from "react";
import { Film, Loader2 } from "lucide-react";
import TmdbSearchModal from "../../components/admin/movie/TmdbSearchModal";
import MovieFormModal from "../../components/admin/movie/MovieFormModal";
import MovieHeader from "../../components/admin/movie/MovieHeader";
import MovieToolbar from "../../components/admin/movie/MovieToolbar";
import MovieCard from "../../components/admin/movie/MovieCard";
import useMovieManagement from "../../hooks/useMovieManagement";

export default function MovieManagement() {
  const {
    movies,
    filteredMovies,
    loading,
    isTmdbModalOpen,
    setIsTmdbModalOpen,
    isFormModalOpen,
    setIsFormModalOpen,
    selectedMovie,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    error,
    fetchMovies,
    handleCreateMovie,
    handleEditMovie,
    handleDeleteMovie,
    countByStatus
  } = useMovieManagement();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <MovieHeader
        onCreateMovie={handleCreateMovie}
        onOpenTmdbImport={() => setIsTmdbModalOpen(true)}
      />

      {/* Toolbar */}
      <MovieToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalCount={movies.length}
        filteredCount={filteredMovies.length}
        countByStatus={countByStatus}
      />

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
            <MovieCard
              key={movie.id}
              movie={movie}
              onEdit={handleEditMovie}
              onDelete={handleDeleteMovie}
            />
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
