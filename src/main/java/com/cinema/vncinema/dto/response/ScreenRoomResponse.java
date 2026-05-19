package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record ScreenRoomResponse(
    Long id,
    String name,
    Long cinemaId,
    String cinemaName,
    Integer totalSeats,
    Boolean isActive,
    List<SeatResponse> seats,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
