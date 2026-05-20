package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.math.BigDecimal;
import java.util.List;

@Builder
public record ShowtimeSeatsResponse(
    Long showtimeId,
    BigDecimal basePrice,
    String screenRoomName,
    String movieTitle,
    List<ShowtimeSeatPriceResponse> seats
) {}
