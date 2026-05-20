package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.request.MovieRequest;
import com.cinema.vncinema.dto.response.MovieResponse;
import com.cinema.vncinema.dto.response.TmdbMovieDetailResponse;
import com.cinema.vncinema.dto.response.TmdbSearchResponse;
import com.cinema.vncinema.entity.Genre;
import com.cinema.vncinema.entity.Movie;
import com.cinema.vncinema.exception.AppException;
import com.cinema.vncinema.exception.ErrorCode;
import com.cinema.vncinema.mapper.MovieMapper;
import com.cinema.vncinema.repository.GenreRepository;
import com.cinema.vncinema.repository.MovieRepository;
import com.cinema.vncinema.service.MovieService;
import com.cinema.vncinema.service.TmdbClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieServiceImpl implements MovieService {

    private final TmdbClient tmdbClient;
    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final MovieMapper movieMapper;

    @Override
    public TmdbSearchResponse searchTmdbMovies(String query, int page) {
        return tmdbClient.searchMovies(query, page);
    }

    @Override
    public TmdbSearchResponse getNowPlayingFromTmdb(int page) {
        return tmdbClient.getNowPlayingMovies(page);
    }

    @Override
    public TmdbSearchResponse getUpcomingFromTmdb(int page) {
        return tmdbClient.getUpcomingMovies(page);
    }

    @Override
    @Transactional
    public MovieResponse importMovieFromTmdb(Long tmdbId) {
        if (movieRepository.existsByTmdbId(tmdbId)) {
            throw new AppException(ErrorCode.MOVIE_EXISTED);
        }

        TmdbMovieDetailResponse tmdbMovie = tmdbClient.getMovieDetails(tmdbId);

        Set<Genre> genres = new HashSet<>();
        if (tmdbMovie.genres() != null) {
            for (TmdbMovieDetailResponse.TmdbGenre tmdbGenre : tmdbMovie.genres()) {
                Genre genre = genreRepository.findByTmdbGenreId(tmdbGenre.id())
                        .orElseGet(() -> {
                            Genre newGenre = Genre.builder()
                                    .tmdbGenreId(tmdbGenre.id())
                                    .name(tmdbGenre.name())
                                    .build();
                            return genreRepository.save(newGenre);
                        });
                genres.add(genre);
            }
        }

        String trailerUrl = null;
        if (tmdbMovie.videos() != null && tmdbMovie.videos().results() != null) {
            trailerUrl = tmdbMovie.videos().results().stream()
                    .filter(v -> "YouTube".equals(v.site()) && "Trailer".equals(v.type()))
                    .findFirst()
                    .map(v -> "https://www.youtube.com/watch?v=" + v.key())
                    .orElse(null);
        }

        String castNames = null;
        if (tmdbMovie.credits() != null && tmdbMovie.credits().cast() != null) {
            castNames = tmdbMovie.credits().cast().stream()
                    .sorted(java.util.Comparator.comparingInt(c -> c.order() != null ? c.order() : 999))
                    .limit(5)
                    .map(TmdbMovieDetailResponse.TmdbCast::name)
                    .collect(Collectors.joining(", "));
        }

        String directorName = null;
        if (tmdbMovie.credits() != null && tmdbMovie.credits().crew() != null) {
            directorName = tmdbMovie.credits().crew().stream()
                    .filter(c -> "Director".equalsIgnoreCase(c.job()))
                    .findFirst()
                    .map(TmdbMovieDetailResponse.TmdbCrew::name)
                    .orElse(null);
        }

        Movie movie = Movie.builder()
                .tmdbId(tmdbId)
                .title(tmdbMovie.title())
                .originalTitle(tmdbMovie.originalTitle())
                .overview(tmdbMovie.overview())
                .duration(tmdbMovie.runtime() != null ? tmdbMovie.runtime() : 0)
                .releaseDate(tmdbMovie.releaseDate() != null && !tmdbMovie.releaseDate().isEmpty() ? LocalDate.parse(tmdbMovie.releaseDate()) : null)
                .posterPath(tmdbMovie.posterPath())
                .backdropPath(tmdbMovie.backdropPath())
                .trailerUrl(trailerUrl)
                .cast(castNames)
                .director(directorName)
                .voteAverage(tmdbMovie.voteAverage())
                .status("UPCOMING")
                .genres(genres)
                .build();

        Movie savedMovie = movieRepository.save(movie);
        return movieMapper.toMovieResponse(savedMovie);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll().stream()
                .map(movieMapper::toMovieResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getMoviesByStatus(String status) {
        return movieRepository.findByStatus(status).stream()
                .map(movieMapper::toMovieResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));
        return movieMapper.toMovieResponse(movie);
    }

    @Override
    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Set<Genre> genres = new HashSet<>();
        if (request.genreIds() != null) {
            genres.addAll(genreRepository.findAllById(request.genreIds()));
        }

        String castString = request.cast() != null ? String.join(", ", request.cast()) : null;

        Movie movie = Movie.builder()
                .title(request.title())
                .originalTitle(request.originalTitle())
                .overview(request.overview())
                .duration(request.duration())
                .releaseDate(request.releaseDate())
                .posterPath(request.posterPath())
                .backdropPath(request.backdropPath())
                .trailerUrl(request.trailerUrl())
                .director(request.director())
                .cast(castString)
                .voteAverage(request.voteAverage())
                .status(request.status())
                .genres(genres)
                .build();

        Movie savedMovie = movieRepository.save(movie);
        return movieMapper.toMovieResponse(savedMovie);
    }

    @Override
    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MOVIE_NOT_FOUND));

        Set<Genre> genres = new HashSet<>();
        if (request.genreIds() != null) {
            genres.addAll(genreRepository.findAllById(request.genreIds()));
        }

        String castString = request.cast() != null ? String.join(", ", request.cast()) : null;

        movie.setTitle(request.title());
        movie.setOriginalTitle(request.originalTitle());
        movie.setOverview(request.overview());
        movie.setDuration(request.duration());
        movie.setReleaseDate(request.releaseDate());
        movie.setPosterPath(request.posterPath());
        movie.setBackdropPath(request.backdropPath());
        movie.setTrailerUrl(request.trailerUrl());
        movie.setDirector(request.director());
        movie.setCast(castString);
        movie.setVoteAverage(request.voteAverage());
        movie.setStatus(request.status());
        movie.setGenres(genres);

        Movie updatedMovie = movieRepository.save(movie);
        return movieMapper.toMovieResponse(updatedMovie);
    }

    @Override
    @Transactional
    public void deleteMovie(Long id) {
        if (!movieRepository.existsById(id)) {
            throw new AppException(ErrorCode.MOVIE_NOT_FOUND);
        }
        movieRepository.deleteById(id);
    }
}

