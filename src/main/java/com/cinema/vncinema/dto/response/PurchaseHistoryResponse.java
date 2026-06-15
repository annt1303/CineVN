package com.cinema.vncinema.dto.response;

import com.cinema.vncinema.entity.MovieFormat;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record PurchaseHistoryResponse(
    Long ticketId,
    String bookingCode,
    String status,
    BigDecimal price,
    String paymentMethod,
    Long showtimeId,
    String movieTitle,
    String moviePosterPath,
    String cinemaName,
    String screenRoomName,
    String seatName,
    String seatType,
    LocalDateTime showtimeStartTime,
    LocalDateTime showtimeEndTime,
    MovieFormat movieFormat,
    LocalDateTime createdAt
) {}
