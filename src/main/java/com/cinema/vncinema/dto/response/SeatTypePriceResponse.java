package com.cinema.vncinema.dto.response;

import com.cinema.vncinema.entity.SeatType;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record SeatTypePriceResponse(
    Long id,
    SeatType seatType,
    BigDecimal surcharge,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
