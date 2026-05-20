import { useState, useEffect } from "react";
import { api } from "../services/api";

export default function useMovieManagement() {
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

  const countByStatus = (key) =>
    key === "ALL" ? movies.length : movies.filter((m) => m.status === key).length;

  const filteredMovies = movies.filter((movie) => {
    const matchSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (movie.originalTitle && movie.originalTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === "ALL" || movie.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return {
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
    setError,
    fetchMovies,
    handleCreateMovie,
    handleEditMovie,
    handleDeleteMovie,
    countByStatus
  };
}
