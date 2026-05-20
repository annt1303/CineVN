package com.cinema.vncinema.controller.public_;

import com.cinema.vncinema.constant.MovieMessages;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.MovieResponse;
import com.cinema.vncinema.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/movies")
@RequiredArgsConstructor
public class PublicMovieController {

    private final MovieService movieService;

    @GetMapping
    public ApiResponse<List<MovieResponse>> getMovies(@RequestParam(required = false) String status) {
        List<MovieResponse> movies = status != null 
                ? movieService.getMoviesByStatus(status) 
                : movieService.getAllMovies();
        return ApiResponse.success(MovieMessages.GET_MOVIES_SUCCESS, movies);
    }

    @GetMapping("/{id}")
    public ApiResponse<MovieResponse> getMovieById(@PathVariable Long id) {
        return ApiResponse.success(MovieMessages.GET_MOVIES_SUCCESS, movieService.getMovieById(id));
    }
}
