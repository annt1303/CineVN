package com.cinema.vncinema.dto.request;

import com.cinema.vncinema.entity.MovieFormat;
import com.cinema.vncinema.entity.RoomType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record BasePriceConfigRequest(
    @NotNull(message = "Room type is required")
    RoomType roomType,

    @NotNull(message = "Movie format is required")
    MovieFormat movieFormat,

    @NotNull(message = "Weekend indicator is required")
    Boolean isWeekend,

    @NotBlank(message = "Time slot is required")
    String timeSlot,

    @NotNull(message = "Base price is required")
    @Min(value = 0, message = "Base price must be non-negative")
    BigDecimal basePrice
) {}
