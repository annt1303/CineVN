package com.cinema.vncinema.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "seat_type_prices")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatTypePrice extends BaseEntity {

    @Column(name = "seat_type", nullable = false, unique = true)
    @Enumerated(EnumType.STRING)
    private SeatType seatType;

    @Column(name = "surcharge", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal surcharge = BigDecimal.ZERO;
}
