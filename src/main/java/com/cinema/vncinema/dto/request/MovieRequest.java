package com.cinema.vncinema.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Builder
public record MovieRequest(
    @NotBlank(message = "Title is required")
    String title,

    String originalTitle,
    String overview,

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    Integer duration,

    LocalDate releaseDate,
    LocalDate endDate,
    String posterPath,
    String backdropPath,
    String trailerUrl,
    String director,
    List<String> cast,
    Double voteAverage,

    @NotBlank(message = "Status is required")
    String status,

    Set<Long> genreIds
) {}
