package com.cinema.vncinema.controller.admin;

import com.cinema.vncinema.constant.CinemaMessages;
import com.cinema.vncinema.dto.request.ScreenRoomRequest;
import com.cinema.vncinema.dto.response.ApiResponse;
import com.cinema.vncinema.dto.response.ScreenRoomResponse;
import com.cinema.vncinema.service.ScreenRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/rooms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminScreenRoomController {

    private final ScreenRoomService screenRoomService;

    @PostMapping
    public ApiResponse<ScreenRoomResponse> createScreenRoom(@Valid @RequestBody ScreenRoomRequest request) {
        ScreenRoomResponse response = screenRoomService.createScreenRoom(request);
        return ApiResponse.success(CinemaMessages.CREATE_ROOM_SUCCESS, response);
    }

    @GetMapping("/{id}")
    public ApiResponse<ScreenRoomResponse> getScreenRoomById(@PathVariable Long id) {
        ScreenRoomResponse response = screenRoomService.getScreenRoomById(id);
        return ApiResponse.success(CinemaMessages.GET_ROOM_SUCCESS, response);
    }

    @GetMapping("/cinema/{cinemaId}")
    public ApiResponse<List<ScreenRoomResponse>> getScreenRoomsByCinemaId(@PathVariable Long cinemaId) {
        List<ScreenRoomResponse> response = screenRoomService.getScreenRoomsByCinemaId(cinemaId);
        return ApiResponse.success(CinemaMessages.GET_ROOMS_SUCCESS, response);
    }

    @PutMapping("/{id}")
    public ApiResponse<ScreenRoomResponse> updateScreenRoom(@PathVariable Long id, @Valid @RequestBody ScreenRoomRequest request) {
        ScreenRoomResponse response = screenRoomService.updateScreenRoom(id, request);
        return ApiResponse.success(CinemaMessages.UPDATE_ROOM_SUCCESS, response);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteScreenRoom(@PathVariable Long id) {
        screenRoomService.deleteScreenRoom(id);
        return ApiResponse.success(CinemaMessages.DELETE_ROOM_SUCCESS);
    }
}
