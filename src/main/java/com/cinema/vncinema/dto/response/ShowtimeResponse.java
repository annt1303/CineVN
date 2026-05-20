package com.cinema.vncinema.dto.response;

import com.cinema.vncinema.entity.MovieFormat;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record ShowtimeResponse(
    Long id,
    Long movieId,
    String movieTitle,
    Integer movieDuration,
    String moviePosterPath,
    Long screenRoomId,
    String screenRoomName,
    Long cinemaId,
    String cinemaName,
    LocalDateTime startTime,
    LocalDateTime endTime,
    MovieFormat movieFormat,
    BigDecimal basePrice,
    Boolean isActive,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
