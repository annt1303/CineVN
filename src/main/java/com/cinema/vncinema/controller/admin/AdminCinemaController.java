package com.cinema.vncinema.controller.admin;

import com.cinema.vncinema.constant.CinemaMessages;
import com.cinema.vncinema.dto.request.CinemaRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.CinemaResponse;
import com.cinema.vncinema.service.CinemaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cinemas")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCinemaController {

    private final CinemaService cinemaService;

    @PostMapping
    public ApiResponse<CinemaResponse> createCinema(@Valid @RequestBody CinemaRequest request) {
        CinemaResponse response = cinemaService.createCinema(request);
        return ApiResponse.success(CinemaMessages.CREATE_CINEMA_SUCCESS, response);
    }

    @GetMapping("/{id}")
    public ApiResponse<CinemaResponse> getCinemaById(@PathVariable Long id) {
        CinemaResponse response = cinemaService.getCinemaById(id);
        return ApiResponse.success(CinemaMessages.GET_CINEMA_SUCCESS, response);
    }

    @GetMapping
    public ApiResponse<List<CinemaResponse>> getAllCinemas() {
        List<CinemaResponse> response = cinemaService.getAllCinemas();
        return ApiResponse.success(CinemaMessages.GET_ALL_CINEMAS_SUCCESS, response);
    }

    @PutMapping("/{id}")
    public ApiResponse<CinemaResponse> updateCinema(@PathVariable Long id, @Valid @RequestBody CinemaRequest request) {
        CinemaResponse response = cinemaService.updateCinema(id, request);
        return ApiResponse.success(CinemaMessages.UPDATE_CINEMA_SUCCESS, response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCinema(@PathVariable Long id) {
        cinemaService.deleteCinema(id);
        return ApiResponse.success(CinemaMessages.DELETE_CINEMA_SUCCESS);
    }
}
