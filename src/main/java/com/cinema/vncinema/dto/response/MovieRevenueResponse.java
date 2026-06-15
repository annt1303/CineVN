package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record MovieRevenueResponse(
    Long movieId,
    String movieTitle,
    Long ticketCount,
    BigDecimal revenue
) {}
