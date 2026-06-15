package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record CinemaRevenueResponse(
    Long cinemaId,
    String cinemaName,
    Long ticketCount,
    BigDecimal revenue
) {}
