package com.cinema.vncinema.dto.request;

import com.cinema.vncinema.entity.SeatType;
import lombok.Builder;

@Builder
public record SeatLayoutRequest(
    String rowName,
    Integer seatNumber,
    Integer gridColumn,
    SeatType seatType,
    Boolean isActive
) {}
