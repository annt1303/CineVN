package com.cinema.vncinema.controller.public_;

import com.cinema.vncinema.constant.ShowtimeMessages;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.ShowtimeResponse;
import com.cinema.vncinema.dto.response.ShowtimeSeatsResponse;
import com.cinema.vncinema.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public/showtimes")
@RequiredArgsConstructor
public class PublicShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping("/movie/{movieId}")
    public ApiResponse<List<ShowtimeResponse>> getShowtimesByMovieAndDate(
            @PathVariable Long movieId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        List<ShowtimeResponse> response = showtimeService.getShowtimesByMovieAndDate(movieId, queryDate);
        return ApiResponse.success(ShowtimeMessages.GET_ALL_SHOWTIMES_SUCCESS, response);
    }

    @GetMapping("/{id}/seats")
    public ApiResponse<ShowtimeSeatsResponse> getShowtimeSeats(
            @PathVariable Long id,
            @RequestParam(required = false) String bookingToken) {
        ShowtimeSeatsResponse response = showtimeService.getShowtimeSeats(id, bookingToken);
        return ApiResponse.success(ShowtimeMessages.GET_SHOWTIME_SUCCESS, response);
    }
}
