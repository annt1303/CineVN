package com.cinema.vncinema.dto.request;

import com.cinema.vncinema.entity.SeatType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record SeatTypePriceRequest(
    @NotNull(message = "Seat type is required")
    SeatType seatType,

    @NotNull(message = "Surcharge is required")
    @Min(value = 0, message = "Surcharge must be non-negative")
    BigDecimal surcharge
) {}
