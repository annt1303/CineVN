package com.cinema.vncinema.dto.request;

import java.util.List;

public record SeatHoldRequest(
    List<Long> seatIds,
    String bookingToken
) {}
