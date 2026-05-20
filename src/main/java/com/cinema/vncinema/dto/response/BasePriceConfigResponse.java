package com.cinema.vncinema.dto.response;

import com.cinema.vncinema.entity.MovieFormat;
import com.cinema.vncinema.entity.RoomType;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record BasePriceConfigResponse(
    Long id,
    RoomType roomType,
    MovieFormat movieFormat,
    Boolean isWeekend,
    String timeSlot,
    BigDecimal basePrice,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
