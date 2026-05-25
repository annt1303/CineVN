package com.cinema.vncinema.service;

import com.cinema.vncinema.dto.request.SeatHoldRequest;
import java.util.List;

public interface SeatHoldService {
    void holdSeats(Long showtimeId, SeatHoldRequest request);
    void releaseSeats(Long showtimeId, SeatHoldRequest request);
    List<Long> getHeldSeatIds(Long showtimeId);
    String getSeatHoldToken(Long showtimeId, Long seatId);
}
