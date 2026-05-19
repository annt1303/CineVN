package com.cinema.vncinema.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record CinemaRequest(
    @NotBlank(message = "Cinema name is required")
    String name,

    @NotBlank(message = "Cinema address is required")
    String address,

    String description
) {}
