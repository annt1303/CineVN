package com.cinema.vncinema.controller.admin;

import com.cinema.vncinema.constant.ShowtimeMessages;
import com.cinema.vncinema.dto.request.ShowtimeRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.ShowtimeResponse;
import com.cinema.vncinema.entity.MovieFormat;
import com.cinema.vncinema.entity.RoomType;
import com.cinema.vncinema.service.PricingService;
import com.cinema.vncinema.service.ShowtimeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/showtimes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminShowtimeController {

    private final ShowtimeService showtimeService;
    private final PricingService pricingService;

    @PostMapping
    public ApiResponse<ShowtimeResponse> createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        ShowtimeResponse response = showtimeService.createShowtime(request);
        return ApiResponse.success(ShowtimeMessages.CREATE_SHOWTIME_SUCCESS, response);
    }

    @GetMapping("/{id}")
    public ApiResponse<ShowtimeResponse> getShowtimeById(@PathVariable Long id) {
        ShowtimeResponse response = showtimeService.getShowtimeById(id);
        return ApiResponse.success(ShowtimeMessages.GET_SHOWTIME_SUCCESS, response);
    }

    @GetMapping
    public ApiResponse<List<ShowtimeResponse>> getAllShowtimes() {
        List<ShowtimeResponse> response = showtimeService.getAllShowtimes();
        return ApiResponse.success(ShowtimeMessages.GET_ALL_SHOWTIMES_SUCCESS, response);
    }

    @GetMapping("/by-date")
    public ApiResponse<List<ShowtimeResponse>> getShowtimesByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<ShowtimeResponse> response = showtimeService.getShowtimesByDate(date);
        return ApiResponse.success(ShowtimeMessages.GET_ALL_SHOWTIMES_SUCCESS, response);
    }

    @PutMapping("/{id}")
    public ApiResponse<ShowtimeResponse> updateShowtime(
            @PathVariable Long id,
            @Valid @RequestBody ShowtimeRequest request) {
        ShowtimeResponse response = showtimeService.updateShowtime(id, request);
        return ApiResponse.success(ShowtimeMessages.UPDATE_SHOWTIME_SUCCESS, response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ApiResponse.success(ShowtimeMessages.DELETE_SHOWTIME_SUCCESS);
    }

    @GetMapping("/calculate-price")
    public ApiResponse<BigDecimal> calculateBasePrice(
            @RequestParam RoomType roomType,
            @RequestParam MovieFormat movieFormat,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime) {
        BigDecimal basePrice = pricingService.calculateBasePrice(roomType, movieFormat, startTime);
        return ApiResponse.success(ShowtimeMessages.GET_SHOWTIME_SUCCESS, basePrice);
    }
}
