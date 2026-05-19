package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.ScreenRoomRequest;
import com.cinema.vncinema.dto.response.ScreenRoomResponse;
import java.util.List;

public interface ScreenRoomService {
    ScreenRoomResponse createScreenRoom(ScreenRoomRequest request);
    ScreenRoomResponse getScreenRoomById(Long id);
    List<ScreenRoomResponse> getScreenRoomsByCinemaId(Long cinemaId);
    ScreenRoomResponse updateScreenRoom(Long id, ScreenRoomRequest request);
    void deleteScreenRoom(Long id);
}
