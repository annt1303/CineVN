package com.cinema.vncinema.dto.request;

import java.util.List;

public record BookTicketsRequest(
    Long showtimeId,
    List<Long> seatIds
) {}
