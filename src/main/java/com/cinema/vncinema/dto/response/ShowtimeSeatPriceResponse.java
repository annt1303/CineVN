package com.cinema.vncinema.dto.response;

import com.cinema.vncinema.entity.SeatType;
import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record ShowtimeSeatPriceResponse(
    Long id,
    String rowName,
    Integer seatNumber,
    Integer gridColumn,
    SeatType seatType,
    BigDecimal price,
    String status // available, booked
) {}
