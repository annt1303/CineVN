package com.cinema.vncinema.dto.response;

import java.math.BigDecimal;

public record TicketResponse(
    Long id,
    Long showtimeId,
    Long seatId,
    String seatName,
    BigDecimal price,
    String status,
    String bookingCode,
    String paymentMethod
) {}

