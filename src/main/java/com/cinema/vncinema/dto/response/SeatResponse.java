package com.cinema.vncinema.dto.response;

import com.cinema.vncinema.entity.SeatType;
import lombok.Builder;

@Builder
public record SeatResponse(
    Long id,
    String rowName,
    Integer seatNumber,
    Integer gridColumn,
    SeatType seatType,
    Boolean isActive
) {}
