package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.time.LocalDate;
import java.util.Set;

@Builder
public record MovieResponse(
    Long id,
    Long tmdbId,
    String title,
    String originalTitle,
    String overview,
    Integer duration,
    LocalDate releaseDate,
    LocalDate endDate,
    String posterPath,
    String backdropPath,
    String trailerUrl,
    String director,
    java.util.List<String> cast,
    Double voteAverage,
    String status,
    Set<GenreResponse> genres
) {}
