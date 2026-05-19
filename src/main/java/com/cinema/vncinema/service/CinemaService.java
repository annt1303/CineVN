package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.CinemaRequest;
import com.cinema.vncinema.dto.response.CinemaResponse;
import java.util.List;

public interface CinemaService {
    CinemaResponse createCinema(CinemaRequest request);
    CinemaResponse getCinemaById(Long id);
    List<CinemaResponse> getAllCinemas();
    CinemaResponse updateCinema(Long id, CinemaRequest request);
    void deleteCinema(Long id);
}
