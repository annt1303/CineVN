package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.response.DashboardReportResponse;
import java.time.LocalDate;

public interface ReportService {
    DashboardReportResponse getDashboardReport(LocalDate startDate, LocalDate endDate);
}
