package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.ShowtimeRequest;
import com.cinema.vncinema.dto.response.ShowtimeResponse;
import com.cinema.vncinema.dto.response.ShowtimeSeatsResponse;

import java.time.LocalDate;
import java.util.List;

public interface ShowtimeService {

    ShowtimeResponse createShowtime(ShowtimeRequest request);

    ShowtimeResponse getShowtimeById(Long id);

    List<ShowtimeResponse> getAllShowtimes();

    ShowtimeResponse updateShowtime(Long id, ShowtimeRequest request);

    void deleteShowtime(Long id);

    List<ShowtimeResponse> getShowtimesByMovieAndDate(Long movieId, LocalDate date);

    List<ShowtimeResponse> getShowtimesByDate(LocalDate date);

    ShowtimeSeatsResponse getShowtimeSeats(Long showtimeId, String bookingToken);
}
