package com.cinema.vncinema.messaging.message;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TicketEmailMessage(
    String toEmail,
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
