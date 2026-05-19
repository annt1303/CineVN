package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record CinemaResponse(
    Long id,
    String name,
    String address,
    String description,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
