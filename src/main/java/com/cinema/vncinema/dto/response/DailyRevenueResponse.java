package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
public record DailyRevenueResponse(
    LocalDate date,
    Long ticketCount,
    BigDecimal revenue
) {}
