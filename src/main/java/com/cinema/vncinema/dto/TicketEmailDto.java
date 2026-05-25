package com.cinema.vncinema.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketEmailDto(
    String bookingCode,
    String movieTitle,
    String cinemaName,
    String roomName,
    LocalDateTime startTime,
    String seatList,
    int ticketCount,
    BigDecimal totalPrice,
    String paymentMethod
) {}
