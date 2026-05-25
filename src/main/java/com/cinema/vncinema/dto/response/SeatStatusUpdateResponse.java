package com.cinema.vncinema.dto.response;

import java.util.List;

public record SeatStatusUpdateResponse(
    Long showtimeId,
    List<Long> seatIds,
    String status, // "held", "available", "booked"
    String bookingToken
) {}
