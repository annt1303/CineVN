package com.cinema.vncinema.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record MomoPaymentVerificationResponse(
    String bookingCode,
    String movieTitle,
    String cinemaName,
    String screenRoomName,
    LocalDateTime startTime,
    List<String> seats,
    BigDecimal totalPrice,
    String paymentMethod,
    String status,
    String userEmail
) {}
