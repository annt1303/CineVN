package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record ReportSummaryResponse(
    BigDecimal totalRevenue,
    Long totalTicketsSold,
    Long totalCinemas,
    Long totalUsers
) {}
