package com.cinema.vncinema.dto.request;

import com.cinema.vncinema.entity.MovieFormat;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record ShowtimeRequest(
    @NotNull(message = "Movie ID is required")
    Long movieId,

    @NotNull(message = "Screen room ID is required")
    Long screenRoomId,

    @NotNull(message = "Start time is required")
    LocalDateTime startTime,

    @NotNull(message = "Movie format is required")
    MovieFormat movieFormat,

    BigDecimal basePrice,
    
    Boolean isActive
) {}
