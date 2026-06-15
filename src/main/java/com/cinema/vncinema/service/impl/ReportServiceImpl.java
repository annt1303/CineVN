package com.cinema.vncinema.service.impl;

import com.cinema.vncinema.dto.response.*;
import com.cinema.vncinema.entity.Role;
import com.cinema.vncinema.repository.CinemaRepository;
import com.cinema.vncinema.repository.TicketRepository;
import com.cinema.vncinema.repository.UserRepository;
import com.cinema.vncinema.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CinemaRepository cinemaRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardReportResponse getDashboardReport(LocalDate startDate, LocalDate endDate) {
        // Default to last 30 days if no range provided
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.minusDays(30);
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // Summary statistics (all-time totals for revenue & tickets; current counts for cinemas/users)
        BigDecimal totalRevenue = ticketRepository.getTotalRevenue();
        long totalTicketsSold = ticketRepository.getTotalTicketsSold();
        long totalCinemas = cinemaRepository.count();
        long totalUsers = userRepository.countByRole(Role.USER);

        ReportSummaryResponse summary = ReportSummaryResponse.builder()
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .totalTicketsSold(totalTicketsSold)
                .totalCinemas(totalCinemas)
                .totalUsers(totalUsers)
                .build();

        // Movie revenue report (filtered by date range)
        List<MovieRevenueResponse> movieRevenue =
                ticketRepository.getMovieRevenueReport(startDateTime, endDateTime);

        // Cinema revenue report (filtered by date range)
        List<CinemaRevenueResponse> cinemaRevenue =
                ticketRepository.getCinemaRevenueReport(startDateTime, endDateTime);

        // Daily revenue report (filtered by date range)
        List<Object[]> dailyRaw =
                ticketRepository.getDailyRevenueReport(startDateTime, endDateTime);

        List<DailyRevenueResponse> dailyRevenue = new ArrayList<>();
        for (Object[] row : dailyRaw) {
            LocalDate date;
            if (row[0] instanceof LocalDate localDate) {
                date = localDate;
            } else if (row[0] instanceof Date sqlDate) {
                date = sqlDate.toLocalDate();
            } else {
                date = ((java.sql.Timestamp) row[0]).toLocalDateTime().toLocalDate();
            }

            Long ticketCount = ((Number) row[1]).longValue();
            BigDecimal revenue = (row[2] instanceof BigDecimal bd) ? bd : new BigDecimal(row[2].toString());

            dailyRevenue.add(DailyRevenueResponse.builder()
                    .date(date)
                    .ticketCount(ticketCount)
                    .revenue(revenue)
                    .build());
        }

        return DashboardReportResponse.builder()
                .summary(summary)
                .movieRevenue(movieRevenue)
                .cinemaRevenue(cinemaRevenue)
                .dailyRevenue(dailyRevenue)
                .build();
    }
}
