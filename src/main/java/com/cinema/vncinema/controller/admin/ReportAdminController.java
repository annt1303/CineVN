package com.cinema.vncinema.controller.admin;

import com.cinema.vncinema.constant.ReportMessages;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.DashboardReportResponse;
import com.cinema.vncinema.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class ReportAdminController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ApiResponse<DashboardReportResponse> getDashboardReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        DashboardReportResponse report = reportService.getDashboardReport(startDate, endDate);
        return ApiResponse.success(ReportMessages.GET_DASHBOARD_REPORT_SUCCESS, report);
    }
}
