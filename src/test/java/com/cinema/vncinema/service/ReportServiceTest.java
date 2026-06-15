package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.response.DashboardReportResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ReportServiceTest {

    @Autowired
    private ReportService reportService;

    @Test
    void getDashboardReportReturnsDataForDateRange() {
        DashboardReportResponse report = reportService.getDashboardReport(
                LocalDate.of(2026, 5, 16),
                LocalDate.of(2026, 6, 15)
        );

        assertThat(report).isNotNull();
        assertThat(report.summary()).isNotNull();
        assertThat(report.movieRevenue()).isNotNull();
        assertThat(report.cinemaRevenue()).isNotNull();
        assertThat(report.dailyRevenue()).isNotNull();
    }
}
