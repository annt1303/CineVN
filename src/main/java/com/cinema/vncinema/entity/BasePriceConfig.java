package com.cinema.vncinema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "base_price_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BasePriceConfig extends BaseEntity {

    @Column(name = "room_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private RoomType roomType;

    @Column(name = "movie_format", nullable = false)
    @Enumerated(EnumType.STRING)
    private MovieFormat movieFormat;

    @Column(name = "is_weekend", nullable = false)
    private Boolean isWeekend;

    // E.g., DAYTIME (before 17:00), EVENING (from 17:00 onwards)
    @Column(name = "time_slot", nullable = false)
    private String timeSlot; 

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;
}
