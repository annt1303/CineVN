package com.cinema.vncinema.controller.public_;

import com.cinema.vncinema.dto.request.SeatHoldRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.service.SeatHoldService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/showtimes/{showtimeId}/seats")
@RequiredArgsConstructor
public class PublicSeatHoldController {

    private final SeatHoldService seatHoldService;

    @PostMapping("/hold")
    public ApiResponse<Void> holdSeats(
            @PathVariable Long showtimeId,
            @RequestBody SeatHoldRequest request) {
        seatHoldService.holdSeats(showtimeId, request);
        return ApiResponse.success("Seats held successfully");
    }

    @PostMapping("/release")
    public ApiResponse<Void> releaseSeats(
            @PathVariable Long showtimeId,
            @RequestBody SeatHoldRequest request) {
        seatHoldService.releaseSeats(showtimeId, request);
        return ApiResponse.success("Seats released successfully");
    }
}
