package com.cinema.vncinema.dto.response;

import lombok.Builder;
import java.util.List;

@Builder
public record DashboardReportResponse(
    ReportSummaryResponse summary,
    List<MovieRevenueResponse> movieRevenue,
    List<CinemaRevenueResponse> cinemaRevenue,
    List<DailyRevenueResponse> dailyRevenue
) {}
