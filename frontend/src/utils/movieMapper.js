export const mapDbMovieToFrontend = (dbMovie) => {
  if (!dbMovie) return null;
  const normalizedCast = Array.isArray(dbMovie.cast)
    ? dbMovie.cast
    : typeof dbMovie.cast === "string"
      ? dbMovie.cast.split(",").map((name) => name.trim()).filter(Boolean)
      : [];

  return {
    id: dbMovie.id,
    title: dbMovie.title,
    originalTitle: dbMovie.originalTitle,
    image: dbMovie.posterPath 
      ? (dbMovie.posterPath.startsWith("http") ? dbMovie.posterPath : `https://image.tmdb.org/t/p/w500${dbMovie.posterPath}`)
      : "/placeholder-poster.jpg",
    backdrop: dbMovie.backdropPath
      ? (dbMovie.backdropPath.startsWith("http") ? dbMovie.backdropPath : `https://image.tmdb.org/t/p/original${dbMovie.backdropPath}`)
      : "/placeholder-backdrop.jpg",
    genre: dbMovie.genres ? Array.from(dbMovie.genres).map(g => g.name) : [],
    duration: dbMovie.duration ? `${dbMovie.duration} min` : "0 min",
    rating: dbMovie.voteAverage ? dbMovie.voteAverage.toFixed(1) : "0.0",
    releaseDate: dbMovie.releaseDate,
    description: dbMovie.overview || "",
    director: dbMovie.director || "",
    cast: normalizedCast,
    trailerUrl: dbMovie.trailerUrl || ""
  };
};
